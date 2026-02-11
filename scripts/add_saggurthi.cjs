const https = require('https');

const SB_URL = 'omykrjfdezyqbsmwsxst.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9teWtyamZkZXp5cWJzbXdzeHN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5MTA0NDEsImV4cCI6MjA1MzQ4NjQ0MX0.6rXPLbUBu3pCVguXjmNUa4dFWKX9En97p6sEYu9ypHE';

function supabaseRequest(method, path, body) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const options = {
            hostname: SB_URL,
            path: '/rest/v1/' + path,
            method: method,
            headers: {
                'apikey': SB_KEY,
                'Authorization': 'Bearer ' + SB_KEY,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            }
        };
        if (payload) options.headers['Content-Length'] = Buffer.byteLength(payload);

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(data ? JSON.parse(data) : null);
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });
        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

function netlifyRequest(body) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(body);
        const options = {
            hostname: 'tus-cricket-pfarrkirchen.de',
            path: '/.netlify/functions/fetch-cricclubs-stats',
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

async function main() {
    // Step 1: Add Nirmal Saggurthi to the squad table
    console.log('Step 1: Adding Nirmal Saggurthi to squad table...');
    try {
        const result = await supabaseRequest('POST', 'squad', {
            name: 'Nirmal Saggurthi',
            is_active: true
        });
        console.log('Squad insert result:', JSON.stringify(result));
    } catch (e) {
        console.error('Squad insert error:', e.message);
        // May fail if already exists, continue anyway
    }

    // Step 2: Write stats via directWrite
    console.log('\nStep 2: Writing stats via directWrite...');
    const statsResult = await netlifyRequest({
        token: 'tus_cricket_sync_2025_secret',
        action: 'directWrite',
        season: 2025,
        players: [
            { player_name: 'Nirmal Saggurthi', format: 'T20', runs: 45, wickets: 1, catches: 2, matches: 9, season: 2025 },
            { player_name: 'Nirmal Saggurthi', format: 'Fifty', runs: 36, wickets: 0, catches: 1, matches: 6, season: 2025 }
        ]
    });
    console.log('Stats write result:', JSON.stringify(statsResult));
}

main().catch(e => console.error('Fatal:', e));
