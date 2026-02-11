/**
 * TuS Cricket - CricClubs Stats Sync Bookmarklet
 *
 * HOW TO USE:
 * 1. Create a new bookmark in your browser
 * 2. Set the name to "Sync TuS Batting", "Sync TuS Bowling", or "Sync TuS Fielding"
 * 3. Set the URL to the minified bookmarklet code (see below)
 *
 * CricClubs Table Column Layout (verified Feb 2026):
 *   Batting:  #(0) | Player(1) | Team(2) | Mat(3) | Ins(4) | No(5) | Runs(6) | Balls(7) | Avg(8) | Sr(9) | Hs(10) | 100s(11) | 50s(12) | 4s(13) | 6s(14)
 *   Bowling:  #(0) | Player(1) | Team(2) | Mat(3) | Ins(4) | Overs(5) | Mdns(6) | Runs(7) | Wkts(8) | BBI(9) | Avg(10) | Econ(11) | Sr(12)
 *   Fielding: #(0) | Player(1) | Team(2) | Catches(3) | WK Catches(4) | ... | Stumpings(7) | Total(8)
 *
 * BOOKMARKLET CODE (copy this as the bookmark URL):
 *
 * For BATTING (T20):
 * javascript:void((function(){const t='tus_cricket_sync_2025_secret',u='https://tus-cricket-pfarrkirchen.de/.netlify/functions/fetch-cricclubs-stats',s='2025',f='T20';const tbl=document.querySelector('#tableBattingRecords');if(!tbl){alert('❌ No batting table found. Make sure you are on the CricClubs Team Batting page.');return;}const rows=tbl.querySelectorAll('tbody tr');const d=[];rows.forEach(r=>{const c=r.cells;if(!c||c.length<10)return;const n=c[1]?.innerText?.trim();if(!n||n==='Total')return;const mat=parseInt(c[3]?.innerText)||0;const runs=parseInt(c[6]?.innerText)||0;if(mat>0||runs>0)d.push({name:n,matches:mat,runs:runs,wickets:0,catches:0});});if(!d.length){alert('❌ No player data found in the table.');return;}fetch(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({season:s,format:f,statsData:d,token:t})}).then(r=>r.json()).then(r=>{if(r.success)alert('✅ Synced '+r.results.success+' batting records to TuS Cricket!');else alert('❌ Error: '+(r.error||'Unknown'));}).catch(e=>alert('❌ Network error: '+e.message));})())
 *
 * For BOWLING (T20):
 * javascript:void((function(){const t='tus_cricket_sync_2025_secret',u='https://tus-cricket-pfarrkirchen.de/.netlify/functions/fetch-cricclubs-stats',s='2025',f='T20';const tbl=document.querySelector('#tableBowlingRecords');if(!tbl){alert('❌ No bowling table found. Make sure you are on the CricClubs Team Bowling page.');return;}const rows=tbl.querySelectorAll('tbody tr');const d=[];rows.forEach(r=>{const c=r.cells;if(!c||c.length<10)return;const n=c[1]?.innerText?.trim();if(!n||n==='Total')return;const mat=parseInt(c[3]?.innerText)||0;const wkts=parseInt(c[8]?.innerText)||0;if(mat>0||wkts>0)d.push({name:n,matches:mat,runs:0,wickets:wkts,catches:0});});if(!d.length){alert('❌ No player data found in the table.');return;}fetch(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({season:s,format:f,statsData:d,token:t})}).then(r=>r.json()).then(r=>{if(r.success)alert('✅ Synced '+r.results.success+' bowling records to TuS Cricket!');else alert('❌ Error: '+(r.error||'Unknown'));}).catch(e=>alert('❌ Network error: '+e.message));})())
 *
 * For FIELDING (T20):
 * javascript:void((function(){const t='tus_cricket_sync_2025_secret',u='https://tus-cricket-pfarrkirchen.de/.netlify/functions/fetch-cricclubs-stats',s='2025',f='T20';const tbl=document.querySelector('#tableFieldingRecords');if(!tbl){alert('❌ No fielding table found. Make sure you are on the CricClubs Team Fielding page.');return;}const rows=tbl.querySelectorAll('tbody tr');const d=[];rows.forEach(r=>{const c=r.cells;if(!c||c.length<5)return;const n=c[1]?.innerText?.trim();if(!n||n==='Total')return;const cat=(parseInt(c[3]?.innerText)||0)+(parseInt(c[4]?.innerText)||0);if(cat>0)d.push({name:n,matches:0,runs:0,wickets:0,catches:cat});});if(!d.length){alert('❌ No player data found in the table.');return;}fetch(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({season:s,format:f,statsData:d,token:t})}).then(r=>r.json()).then(r=>{if(r.success)alert('✅ Synced '+r.results.success+' fielding records to TuS Cricket!');else alert('❌ Error: '+(r.error||'Unknown'));}).catch(e=>alert('❌ Network error: '+e.message));})())
 *
 * IMPORTANT: Update the token 't', season 's', and format 'f' as needed.
 *
 * For 50-Over format, change f='T20' to f='Fifty' in the bookmarklet code.
 */

// This file is for reference only. The actual bookmarklet runs in the browser
// from the CricClubs website. It is NOT imported by the TuS Cricket app.
