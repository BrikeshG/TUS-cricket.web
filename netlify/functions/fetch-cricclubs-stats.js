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

// Netlify Scheduled Function - Runs every day at 2:00 AM UTC
exports.handler = async (event, context) => {
    try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // Parse body if it exists
        let body = {};
        if (event.body) {
            try {
                body = JSON.parse(event.body);
            } catch (e) {
                console.error("Failed to parse request body");
            }
        }

        // Security check: Verify sync token for all requests (except maybe internal cron but safer to require it everywhere)
        // For the automated CRON, we can't easily pass a token, so we only enforce it if 'token' or 'statsData' is present
        // OR if it's an HTTP POST which usually comes from our UI.
        const token = body.token || (event.queryStringParameters && event.queryStringParameters.token);
        const EXPECTED_TOKEN = process.env.VITE_SYNC_TOKEN || process.env.SYNC_TOKEN;

        // If it's an HTTP POST (likely from our UI) or statsData is provided, REQUIRE the token
        if ((event.httpMethod === 'POST' || body.statsData) && EXPECTED_TOKEN && token !== EXPECTED_TOKEN) {
            console.warn('Unauthorized sync attempt detected');
            return {
                statusCode: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ success: false, error: 'Unauthorized: Invalid sync token' })
            };
        }

        // Auto-detect season if not provided
        let season = body.season || (event.queryStringParameters && event.queryStringParameters.season) || currentYear;
        if (!body.season && !(event.queryStringParameters && event.queryStringParameters.season)) {
            if (currentMonth < 3 && currentYear === 2026) {
                season = 2025;
            }
        }
        season = parseInt(season);

        const format = body.format || (event.queryStringParameters && event.queryStringParameters.format);
        const statsData = body.statsData; // Array of { name, runs, wickets, catches, matches }

        console.log(`Starting CricClubs stats sync for season ${season}, format ${format || 'All'}...`);

        // Initialize Supabase client
        const supabase = createClient(supabaseUrl, supabaseKey);

        let finalStats = {}; // { playerName: { t20: {...}, fifty: {...} } }

        if (statsData && Array.isArray(statsData)) {
            console.log(`Received ${statsData.length} stats records from client for format ${format}`);
            if (!format) throw new Error("Format is required when providing statsData");

            // Process provided data
            statsData.forEach(item => {
                const name = item.name;
                if (!name) return;

                if (!finalStats[name]) {
                    finalStats[name] = {
                        t20: { runs: 0, wickets: 0, catches: 0, matches: 0 },
                        fifty: { runs: 0, wickets: 0, catches: 0, matches: 0 }
                    };
                }

                const key = format === 'T20' ? 't20' : 'fifty';
                finalStats[name][key] = {
                    runs: parseInt(item.runs) || 0,
                    wickets: parseInt(item.wickets) || 0,
                    catches: parseInt(item.catches) || 0,
                    matches: parseInt(item.matches) || 0
                };
            });
        } else {
            // Proceed with automated scraping
            console.log(`Using automated scraping fallback...`);

            let t20Stats = { batting: {}, bowling: {}, fielding: {} };
            let fiftyStats = { batting: {}, bowling: {}, fielding: {} };

            if (!format || format === 'T20') {
                console.log(`Fetching T20 stats for team ${T20_TEAM_ID}...`);
                t20Stats = await fetchAllTeamStats(T20_TEAM_ID);
            }

            if (!format || format === 'Fifty') {
                console.log(`Fetching 50-over stats for team ${FIFTY_TEAM_ID}...`);
                fiftyStats = await fetchAllTeamStats(FIFTY_TEAM_ID);
            }

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

            // Combine stats
            finalStats = combineCompleteStats(t20Stats, fiftyStats, mappingMap);
        }

        console.log(`Updating ${Object.keys(finalStats).length} players in Supabase...`);

        const updateResults = {
            success: 0,
            failed: 0,
            skipped: 0
        };

        for (const playerName in finalStats) {
            const stats = finalStats[playerName];

            // Update formats
            const formatsToUpdate = format ? [format] : ['T20', 'Fifty'];

            for (const fmt of formatsToUpdate) {
                const key = fmt === 'T20' ? 't20' : 'fifty';
                const s = stats[key];

                // Only update if there's actual data (unless it's a manual sync intended to clear/overwrite)
                if (s.matches > 0 || s.runs > 0 || s.wickets > 0 || s.catches > 0) {
                    const { error } = await supabase
                        .from('player_stats')
                        .upsert({
                            player_name: playerName,
                            season: season,
                            format: fmt,
                            runs: s.runs,
                            wickets: s.wickets,
                            catches: s.catches,
                            matches: s.matches,
                            updated_at: new Date().toISOString()
                        }, {
                            onConflict: 'player_name,season,format'
                        });

                    if (error) {
                        console.error(`Error updating ${fmt} for ${playerName}:`, error);
                        updateResults.failed++;
                    } else {
                        updateResults.success++;
                    }
                } else {
                    updateResults.skipped++;
                }
            }

            // Update last_stats_update in squad table
            await supabase
                .from('squad')
                .update({ last_stats_update: new Date().toISOString() })
                .eq('name', playerName);
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: JSON.stringify({
                success: true,
                message: `Stats sync for season ${season} completed`,
                results: updateResults,
                playersProcessed: Object.keys(finalStats).length
            })
        };

    } catch (error) {
        console.error('Error syncing stats:', error);
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


// Add scheduled configuration for Netlify
// Runs every day at 2am UTC
exports.config = {
    schedule: "0 2 * * *"
};

async function fetchAllTeamStats(teamId) {
    const categories = ['Batting', 'Bowling', 'Fielding'];
    const results = {
        batting: {},
        bowling: {},
        fielding: {}
    };

    for (const category of categories) {
        try {
            // Add a small delay between requests to avoid rate limiting/bot detection
            await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

            const url = `https://cricclubs.com/BayerischerCricketVerbandeV/team${category}.do?teamId=${teamId}&clubId=${CLUB_ID}`;
            console.log(`Fetching ${category} from: ${url}`);

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
                    'Referer': 'https://cricclubs.com/',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                },
                timeout: 15000
            });

            if (!response.ok) {
                const text = await response.text();
                console.error(`Failed to fetch ${category} for team ${teamId}: ${response.status}`);
                console.error(`Response snippet: ${text.substring(0, 200)}`);
                continue;
            }

            const html = await response.text();
            if (html.includes('Cloudflare') || html.includes('Access Denied')) {
                console.error(`Bot protection detected for ${category}`);
                continue;
            }

            const $ = cheerio.load(html);
            const key = category.toLowerCase();

            // Find the data table - CricClubs tables are usually inside a specific div or just the first table
            $('table').each((i, table) => {
                const $table = $(table);
                const headers = [];
                $table.find('thead tr th').each((j, th) => {
                    headers.push($(th).text().trim().toLowerCase());
                });

                if (headers.includes('player') || headers.includes('name')) {
                    $table.find('tbody tr').each((j, row) => {
                        const cells = $(row).find('td');
                        if (cells.length > 1) {
                            const name = $(cells[1]).text().trim();
                            if (name && name !== 'Player' && name !== 'Total') {
                                if (key === 'batting') {
                                    const m = parseInt($(cells[3]).text().trim()) || 0;
                                    const r = parseInt($(cells[6]).text().trim()) || 0;
                                    results.batting[name] = { matches: m, runs: r };
                                } else if (key === 'bowling') {
                                    const m = parseInt($(cells[3]).text().trim()) || 0;
                                    const w = parseInt($(cells[7]).text().trim()) || 0;
                                    results.bowling[name] = { matches: m, wickets: w };
                                } else if (key === 'fielding') {
                                    const c = parseInt($(cells[3]).text().trim()) || 0;
                                    results.fielding[name] = { catches: c };
                                }
                            }
                        }
                    });
                }
            });
            console.log(`Parsed ${Object.keys(results[key]).length} ${category} records`);
        } catch (err) {
            console.error(`Error in ${category} fetch:`, err.message);
        }
    }

    return results;
}

function combineCompleteStats(t20Stats, fiftyStats, mappingMap) {
    const combined = {};

    function processStats(sourceStats, bundleKey) {
        // Collect all names from all categories
        const names = new Set([
            ...Object.keys(sourceStats.batting),
            ...Object.keys(sourceStats.bowling),
            ...Object.keys(sourceStats.fielding)
        ]);

        names.forEach(name => {
            const mappedName = mappingMap[name.toLowerCase()] || name;
            if (!combined[mappedName]) {
                combined[mappedName] = {
                    t20: { runs: 0, wickets: 0, catches: 0, matches: 0 },
                    fifty: { runs: 0, wickets: 0, catches: 0, matches: 0 },
                    total: { runs: 0, wickets: 0, catches: 0, matches: 0 }
                };
            }

            combined[mappedName][bundleKey].runs += sourceStats.batting[name]?.runs || 0;
            combined[mappedName][bundleKey].matches = Math.max(combined[mappedName][bundleKey].matches, sourceStats.batting[name]?.matches || 0);
            combined[mappedName][bundleKey].wickets += sourceStats.bowling[name]?.wickets || 0;
            combined[mappedName][bundleKey].catches += sourceStats.fielding[name]?.catches || 0;
        });
    }

    processStats(t20Stats, 't20');
    processStats(fiftyStats, 'fifty');

    // Final totals
    for (const name in combined) {
        const p = combined[name];
        p.total.runs = p.t20.runs + p.fifty.runs;
        p.total.wickets = p.t20.wickets + p.fifty.wickets;
        p.total.catches = p.t20.catches + p.fifty.catches;
        p.total.matches = p.t20.matches + p.fifty.matches;
    }

    return combined;
}
