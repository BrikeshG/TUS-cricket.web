const { createClient } = require('@supabase/supabase-js');
const cheerio = require('cheerio');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const CLUB_ID = '40958';
const T20_TEAM_ID = '1487';
const FIFTY_TEAM_ID = '1511';

exports.handler = async (event, context) => {
    try {
        console.log('Starting CricClubs stats fetch...');

        // Fetch stats from both leagues
        const t20Stats = await fetchTeamStats(T20_TEAM_ID);
        const fiftyStats = await fetchTeamStats(FIFTY_TEAM_ID);

        // Get name mappings from Supabase
        const { data: mappings } = await supabase
            .from('mappings')
            .select('*');

        const mappingMap = {};
        if (mappings) {
            mappings.forEach(m => {
                mappingMap[m.source_name.toLowerCase()] = m.target_name;
            });
        }

        // Combine stats and update database
        const combinedStats = combineStats(t20Stats, fiftyStats, mappingMap);

        for (const playerName in combinedStats) {
            const stats = combinedStats[playerName];

            // Update or insert player
            const { error } = await supabase
                .from('squad')
                .upsert({
                    name: playerName,
                    t20_runs: stats.t20.runs,
                    t20_wickets: stats.t20.wickets,
                    t20_catches: stats.t20.catches,
                    t20_matches: stats.t20.matches,
                    fifty_runs: stats.fifty.runs,
                    fifty_wickets: stats.fifty.wickets,
                    fifty_catches: stats.fifty.catches,
                    fifty_matches: stats.fifty.matches,
                    total_runs: stats.total.runs,
                    total_wickets: stats.total.wickets,
                    total_catches: stats.total.catches,
                    total_matches: stats.total.matches,
                    last_stats_update: new Date().toISOString(),
                    is_active: true
                }, {
                    onConflict: 'name'
                });

            if (error) {
                console.error(`Error updating ${playerName}:`, error);
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                message: 'Stats updated successfully',
                playersUpdated: Object.keys(combinedStats).length
            })
        };

    } catch (error) {
        console.error('Error fetching stats:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

async function fetchTeamStats(teamId) {
    const baseUrl = `https://cricclubs.com/BayerischerCricketVerbandeV/viewTeam.do?teamId=${teamId}&clubId=${CLUB_ID}`;

    const stats = {
        batting: {},
        bowling: {},
        fielding: {}
    };

    try {
        // Fetch batting stats
        const battingResponse = await fetch(baseUrl);
        const battingHtml = await battingResponse.text();
        const $batting = cheerio.load(battingHtml);

        // Parse batting table
        $batting('table.table-responsive tbody tr').each((i, row) => {
            const cells = $batting(row).find('td');
            if (cells.length > 0) {
                const name = $batting(cells[0]).text().trim();
                const matches = parseInt($batting(cells[1]).text().trim()) || 0;
                const runs = parseInt($batting(cells[4]).text().trim()) || 0;

                if (name && name !== 'Player') {
                    stats.batting[name] = { runs, matches };
                }
            }
        });

        // Fetch bowling stats (same page, different tab - we'll parse from same HTML)
        $batting('table.table-responsive tbody tr').each((i, row) => {
            const cells = $batting(row).find('td');
            if (cells.length > 0) {
                const name = $batting(cells[0]).text().trim();
                const wickets = parseInt($batting(cells[4]).text().trim()) || 0;

                if (name && name !== 'Player') {
                    stats.bowling[name] = { wickets };
                }
            }
        });

        // Fetch fielding stats
        $batting('table.table-responsive tbody tr').each((i, row) => {
            const cells = $batting(row).find('td');
            if (cells.length > 0) {
                const name = $batting(cells[0]).text().trim();
                const catches = parseInt($batting(cells[1]).text().trim()) || 0;

                if (name && name !== 'Player') {
                    stats.fielding[name] = { catches };
                }
            }
        });

    } catch (error) {
        console.error(`Error fetching stats for team ${teamId}:`, error);
    }

    return stats;
}

function combineStats(t20Stats, fiftyStats, mappingMap) {
    const combined = {};

    // Process T20 stats
    for (const name in t20Stats.batting) {
        const mappedName = mappingMap[name.toLowerCase()] || name;

        if (!combined[mappedName]) {
            combined[mappedName] = {
                t20: { runs: 0, wickets: 0, catches: 0, matches: 0 },
                fifty: { runs: 0, wickets: 0, catches: 0, matches: 0 },
                total: { runs: 0, wickets: 0, catches: 0, matches: 0 }
            };
        }

        combined[mappedName].t20.runs = t20Stats.batting[name]?.runs || 0;
        combined[mappedName].t20.matches = t20Stats.batting[name]?.matches || 0;
        combined[mappedName].t20.wickets = t20Stats.bowling[name]?.wickets || 0;
        combined[mappedName].t20.catches = t20Stats.fielding[name]?.catches || 0;
    }

    // Process 50-over stats
    for (const name in fiftyStats.batting) {
        const mappedName = mappingMap[name.toLowerCase()] || name;

        if (!combined[mappedName]) {
            combined[mappedName] = {
                t20: { runs: 0, wickets: 0, catches: 0, matches: 0 },
                fifty: { runs: 0, wickets: 0, catches: 0, matches: 0 },
                total: { runs: 0, wickets: 0, catches: 0, matches: 0 }
            };
        }

        combined[mappedName].fifty.runs = fiftyStats.batting[name]?.runs || 0;
        combined[mappedName].fifty.matches = fiftyStats.batting[name]?.matches || 0;
        combined[mappedName].fifty.wickets = fiftyStats.bowling[name]?.wickets || 0;
        combined[mappedName].fifty.catches = fiftyStats.fielding[name]?.catches || 0;
    }

    // Calculate totals
    for (const name in combined) {
        combined[name].total.runs = combined[name].t20.runs + combined[name].fifty.runs;
        combined[name].total.wickets = combined[name].t20.wickets + combined[name].fifty.wickets;
        combined[name].total.catches = combined[name].t20.catches + combined[name].fifty.catches;
        combined[name].total.matches = combined[name].t20.matches + combined[name].fifty.matches;
    }

    return combined;
}
