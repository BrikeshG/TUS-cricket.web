const { createClient } = require('@supabase/supabase-js');
const cheerio = require('cheerio');

// More robust fetch import for Netlify/esbuild
const nodeFetch = require('node-fetch');
const fetch = typeof globalThis.fetch === 'function' ? globalThis.fetch : nodeFetch;

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const CLUB_ID = '40958';
const T20_TEAM_ID = '1487';
const FIFTY_TEAM_ID = '1511';

exports.handler = async (event, context) => {
    try {
        console.log('Starting CricClubs stats fetch...');

        // Initialize Supabase client
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch stats from both leagues
        console.log(`Using fetch: ${typeof fetch}`);
        console.log(`Fetching T20 stats for team ${T20_TEAM_ID}...`);
        const t20Stats = await fetchTeamStats(T20_TEAM_ID);
        console.log(`Fetching 50-over stats for team ${FIFTY_TEAM_ID}...`);
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

        console.log(`Updating ${Object.keys(combinedStats).length} players...`);

        let successCount = 0;
        let errorCount = 0;

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
                errorCount++;
            } else {
                successCount++;
            }
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                message: 'Stats updated successfully',
                playersUpdated: successCount,
                errors: errorCount
            })
        };

    } catch (error) {
        console.error('Error fetching stats:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};

async function fetchTeamStats(teamId) {
    const stats = {
        batting: {},
        bowling: {},
        fielding: {}
    };

    try {
        // Fetch batting stats
        const battingUrl = `https://cricclubs.com/BayerischerCricketVerbandeV/viewTeam.do?teamId=${teamId}&clubId=${CLUB_ID}`;
        console.log(`Fetching from: ${battingUrl}`);

        const response = await fetch(battingUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Parse batting stats - look for the batting table
        $('table').each((tableIndex, table) => {
            const $table = $(table);
            const headers = [];

            // Get headers
            $table.find('thead tr th, thead tr td').each((i, th) => {
                headers.push($(th).text().trim().toLowerCase());
            });

            // Check if this is the batting table
            if (headers.includes('player') || headers.includes('name')) {
                $table.find('tbody tr').each((i, row) => {
                    const cells = $(row).find('td');
                    if (cells.length > 0) {
                        const name = $(cells[0]).text().trim();

                        // Skip header rows and empty names
                        if (name && name !== 'Player' && name !== 'Name') {
                            // Try to find runs and matches columns
                            const matches = parseInt($(cells[1]).text().trim()) || 0;
                            const runs = parseInt($(cells[4]).text().trim()) || 0;

                            if (runs > 0 || matches > 0) {
                                stats.batting[name] = { runs, matches };
                            }
                        }
                    }
                });
            }
        });

        console.log(`Found ${Object.keys(stats.batting).length} players with batting stats`);

    } catch (error) {
        console.error(`Error fetching stats for team ${teamId}:`, error.message);
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
