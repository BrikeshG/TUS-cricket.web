const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
    'https://omykrjfdezyqbsmwsxst.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9teWtyamZkZXp5cWJzbXdzeHN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5MTA0NDEsImV4cCI6MjA1MzQ4NjQ0MX0.6rXPLbUBu3pCVguXjmNUa4dFWKX9En97p6sEYu9ypHE'
);

async function run() {
    // Try different table names for squad members
    for (const tbl of ['squad_members', 'players', 'squad', 'members']) {
        const { data, error } = await supabase.from(tbl).select('*').limit(1);
        if (!error && data && data.length > 0) {
            console.log('Found table:', tbl, 'columns:', Object.keys(data[0]).join(', '));
            const { data: all } = await supabase.from(tbl).select('name').order('name');
            if (all) {
                console.log('\n=== ' + tbl + ' NAMES ===');
                all.forEach(m => console.log(JSON.stringify(m.name)));
            }
        }
    }

    // Get player_stats
    const { data: stats, error: statsError } = await supabase
        .from('player_stats')
        .select('player_name,format,runs,wickets,catches,matches')
        .eq('season', 2025)
        .order('player_name');

    if (statsError) {
        console.log('Stats error:', statsError.message);
    } else if (stats) {
        console.log('\n=== PLAYER STATS (season 2025) ===');
        stats.forEach(s => console.log(JSON.stringify(s)));
    }
}

run().catch(e => console.error(e));
