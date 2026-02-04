import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { signOut, getCurrentUser } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { LogOut, Plus, Edit2, Trash2, Upload, BarChart2, RefreshCw } from 'lucide-react';
import Mappings from './Mappings';
import './Dashboard.css';

const Dashboard = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState(null);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [activeTab, setActiveTab] = useState('players');

    // Sync Stats State
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
    const [syncLoading, setSyncLoading] = useState(false);
    const [syncStatus, setSyncStatus] = useState({ type: '', message: '' });
    const [statsPastedData, setStatsPastedData] = useState('');
    const [syncFormat, setSyncFormat] = useState('T20');
    const [syncSeason, setSyncSeason] = useState(new Date().getFullYear().toString());

    const navigate = useNavigate();

    useEffect(() => {
        loadUser();
        loadPlayers();
    }, []);

    const loadUser = async () => {
        const { user } = await getCurrentUser();
        setUser(user);
    };

    const loadPlayers = async () => {
        if (!supabase) return;

        const { data, error } = await supabase
            .from('squad')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error loading players:', error);
        } else if (data) {
            setPlayers(data);
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/admin/login');
    };

    const handleAddPlayer = async (e) => {
        e.preventDefault();
        if (!newPlayerName.trim()) return;

        const { error } = await supabase
            .from('squad')
            .insert([{ name: newPlayerName.trim(), is_active: true }]);

        if (error) {
            console.error('Error adding player:', error);
            alert('Failed to add player: ' + error.message);
        } else {
            setNewPlayerName('');
            setShowAddModal(false);
            loadPlayers();
        }
    };

    const handleDeletePlayer = async (id) => {
        if (!confirm('Are you sure you want to delete this player?')) return;

        const { error } = await supabase
            .from('squad')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Delete error:', error);
            alert('Failed to delete player: ' + error.message);
        } else {
            loadPlayers();
        }
    };

    const handleToggleActive = async (player) => {
        const { error } = await supabase
            .update({ is_active: !player.is_active })
            .from('squad')
            .eq('id', player.id);

        if (error) {
            console.error('Update error:', error);
            alert('Failed to update player: ' + error.message);
        } else {
            loadPlayers();
        }
    };

    const handleSyncSubmit = async () => {
        if (!statsPastedData.trim()) {
            setSyncStatus({ type: 'error', message: 'Please paste the stats data first.' });
            return;
        }

        setSyncLoading(true);
        setSyncStatus({ type: '', message: '' });

        try {
            // Try to parse multi-line format first (common when copying from web)
            // Pattern: \n [Rank] [Name] \n [Team] \n [Stats]
            // Example:
            // 18 Naveen Kumar Shanmugam
            // TUSPF
            // 1 0 0 0 0 -- 0.00 ...

            // We'll look for blocks of text
            const rawText = statsPastedData.trim();
            const lines = rawText.split('\n').map(l => l.trim()).filter(l => l);
            const parsedData = [];

            // Attempt 1: Multi-line parser (State machine approach)
            let i = 0;
            while (i < lines.length) {
                const line = lines[i];

                // Check for Name line (starts with number, then space, then letters)
                // e.g. "18 Naveen Kumar Shanmugam"
                const nameMatch = line.match(/^\d+\s+([A-Za-z\s\.\-]+)$/);

                if (nameMatch) {
                    const name = nameMatch[1].trim();

                    // Look ahead for TUSPF (Team Name) or stats directly
                    // Usually next line is Team Name "TUSPF"
                    let statsLine = null;

                    if (lines[i + 1] === 'TUSPF' || lines[i + 1]?.length < 10) {
                        // Skip team name line
                        if (lines[i + 2]) statsLine = lines[i + 2];
                        i += 3;
                    } else {
                        // Maybe stats are directly on next line
                        if (lines[i + 1]) statsLine = lines[i + 1];
                        i += 2;
                    }

                    if (statsLine) {
                        // Parse stats line: "1 0 0 0 0 -- 0.00 ..."
                        // Matches is usually the 1st number
                        // Runs is usually the 4th number (Mat, Inn, NO, Runs) for Batting
                        // Matches is 1st, Wickets is 5th for Bowling (Mat, Inn, Balls, Runs, Wkts)

                        const statsParts = statsLine.split(/[\s\t]+/).filter(p => p !== '');

                        if (statsParts.length >= 4) {
                            let matches = parseInt(statsParts[0]) || 0;
                            let runs = 0;
                            let wickets = 0;

                            // Simple heuristic: 
                            // Bowling usually has overs (e.g. 10.2) which contains a dot in 3rd or 4th pos
                            // Batting usually has huge runs in 4th pos

                            // Let's assume the user selects format in UI or we try to guess
                            // For T20/Fifty Batting: Mat, Inn, NO, Runs, HS, Ave...
                            // For T20/Fifty Bowling: Mat, Inn, Overs, Mdns, Runs, Wkts...

                            // Check if line looks like bowling (has dot in overs column, usually index 2 or 3)
                            const isBowling = statsParts[2].includes('.') || statsParts[3].includes('.');

                            if (isBowling) {
                                wickets = parseInt(statsParts[5]) || parseInt(statsParts[6]) || 0; // fallback positions
                            } else {
                                runs = parseInt(statsParts[3]) || 0;
                            }

                            parsedData.push({
                                name: name,
                                matches,
                                runs,
                                wickets,
                                catches: 0
                            });
                            continue;
                        }
                    }
                }

                // If we didn't match a multi-line block, stick to single line check
                // Fallback to Tab-separated single line (Spreadsheet copy)
                const parts = line.split('\t').map(p => p.trim()).filter(p => p !== '');
                if (parts.length >= 5) {
                    const nameCandidate = parts[1];
                    if (nameCandidate && nameCandidate !== 'Player' && nameCandidate !== 'Total' && isNaN(nameCandidate)) {
                        let matches = parseInt(parts[3]) || 0;
                        let runs = 0;
                        let wickets = 0;

                        if (line.includes('.')) { // likely bowling
                            wickets = parseInt(parts[7]) || 0;
                        } else {
                            runs = parseInt(parts[6]) || 0;
                        }

                        parsedData.push({
                            name: nameCandidate,
                            matches,
                            runs,
                            wickets,
                            catches: 0
                        });
                    }
                }

                i++;
            }

            if (parsedData.length === 0) {
                throw new Error("Could not find any player stats in the pasted text.");
            }

            // Get sync token from env
            const syncToken = import.meta.env.VITE_SYNC_TOKEN;

            const response = await fetch('/.netlify/functions/fetch-cricclubs-stats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    season: syncSeason,
                    format: syncFormat,
                    statsData: parsedData,
                    token: syncToken // Secure token check
                })
            });

            if (!response.ok) {
                const text = await response.text();
                // Try to parse JSON error if possible, otherwise use status text
                try {
                    const json = JSON.parse(text);
                    throw new Error(json.error || `Server error: ${response.status} ${response.statusText}`);
                } catch (e) {
                    // If we're on localhost and get a 404, it's likely the function isn't running
                    if (response.status === 404 && window.location.hostname === 'localhost') {
                        throw new Error("Sync service not available locally. Please deploy to Netlify to test this feature.");
                    }
                    throw new Error(`Sync failed (${response.status}): ${response.statusText || 'Unknown error'}`);
                }
            }

            const result = await response.json();

            if (result.success) {
                setSyncStatus({
                    type: 'success',
                    message: `Successfully updated ${result.results.success} records!`
                });
                setTimeout(() => {
                    setIsSyncModalOpen(false);
                    setSyncStatus({ type: '', message: '' });
                    setStatsPastedData('');
                }, 2000);
            } else {
                throw new Error(result.error || "Failed to update stats");
            }

        } catch (err) {
            setSyncStatus({ type: 'error', message: err.message });
        } finally {
            setSyncLoading(false);
        }
    };

    return (
        <div className="admin-dashboard">
            <Helmet>
                <title>Admin Dashboard | TuS Cricket</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            {/* Header */}
            <header className="admin-header">
                <div className="container">
                    <div className="header-content">
                        <div>
                            <h1>Admin Dashboard</h1>
                            <p>Manage squad members and stats</p>
                        </div>
                        <button onClick={handleLogout} className="logout-btn">
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="admin-content">
                <div className="container">
                    {/* Tabs */}
                    <div className="tabs">
                        <button
                            className={`tab ${activeTab === 'players' ? 'active' : ''}`}
                            onClick={() => setActiveTab('players')}
                        >
                            Players
                        </button>
                        <button
                            className={`tab ${activeTab === 'mappings' ? 'active' : ''}`}
                            onClick={() => setActiveTab('mappings')}
                        >
                            Name Mappings
                        </button>
                        <button
                            className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
                            onClick={() => setActiveTab('stats')}
                        >
                            Statistics
                        </button>
                    </div>

                    {activeTab === 'players' ? (
                        <>
                            <div className="actions-bar">
                                <h2>Squad Members ({players.length})</h2>
                                <button onClick={() => setShowAddModal(true)} className="add-btn">
                                    <Plus size={18} /> Add Player
                                </button>
                            </div>

                            {loading ? (
                                <div className="loading">Loading players...</div>
                            ) : (
                                <div className="players-table-container">
                                    <table className="players-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Status</th>
                                                <th>Photo</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {players.map((player) => (
                                                <tr key={player.id}>
                                                    <td className="player-name">{player.name}</td>
                                                    <td>
                                                        <button
                                                            onClick={() => handleToggleActive(player)}
                                                            className={`status-badge ${player.is_active ? 'active' : 'inactive'}`}
                                                        >
                                                            {player.is_active ? 'Active' : 'Inactive'}
                                                        </button>
                                                    </td>
                                                    <td>
                                                        {player.photo_url ? (
                                                            <span className="has-photo">✓ Has Photo</span>
                                                        ) : (
                                                            <span className="no-photo">No Photo</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button
                                                                onClick={() => handleDeletePlayer(player.id)}
                                                                className="delete-btn"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    ) : activeTab === 'mappings' ? (
                        <Mappings />
                    ) : (
                        <div className="stats-tab-container">
                            <div className="stats-card">
                                <div className="stats-card-header">
                                    <h3>CricClubs Player Stats Sync</h3>
                                    <p>Manually update player statistics by pasting data from CricClubs.</p>
                                </div>
                                <div className="stats-actions">
                                    <button
                                        className="sync-now-btn"
                                        onClick={() => setIsSyncModalOpen(true)}
                                    >
                                        <RefreshCw size={20} />
                                        Sync Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Add Player Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Add New Player</h3>
                        <form onSubmit={handleAddPlayer}>
                            <div className="form-group">
                                <label htmlFor="playerName">Player Name</label>
                                <input
                                    type="text"
                                    id="playerName"
                                    value={newPlayerName}
                                    onChange={(e) => setNewPlayerName(e.target.value)}
                                    placeholder="Enter player name"
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowAddModal(false)} className="cancel-btn">
                                    Cancel
                                </button>
                                <button type="submit" className="submit-btn">
                                    Add Player
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Sync Stats Modal */}
            {isSyncModalOpen && (
                <div className="sync-modal-overlay">
                    <div className="sync-modal">
                        <div className="sync-modal-header">
                            <h3>Sync Stats with CricClubs</h3>
                            <button className="close-modal" onClick={() => setIsSyncModalOpen(false)}>&times;</button>
                        </div>

                        <div className="sync-instructions">
                            <p>Copy and paste statistics from CricClubs to update the website.</p>
                            <div className="sync-links">
                                <a href="https://cricclubs.com/BayerischerCricketVerbandeV/teamBatting.do?teamId=1487&clubId=40958" target="_blank" rel="noopener noreferrer" className="sync-link">T20 Batting</a>
                                <a href="https://cricclubs.com/BayerischerCricketVerbandeV/teamBowling.do?teamId=1487&clubId=40958" target="_blank" rel="noopener noreferrer" className="sync-link">T20 Bowling</a>
                            </div>
                        </div>

                        <div className="sync-form-group">
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label>Season</label>
                                    <select
                                        value={syncSeason}
                                        onChange={(e) => setSyncSeason(e.target.value)}
                                        className="season-dropdown"
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                                    >
                                        <option value="2025">2025</option>
                                        <option value="2026">2026</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Format</label>
                                    <select
                                        value={syncFormat}
                                        onChange={(e) => setSyncFormat(e.target.value)}
                                        className="season-dropdown"
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                                    >
                                        <option value="T20">T20</option>
                                        <option value="Fifty">50-Over</option>
                                    </select>
                                </div>
                            </div>

                            <label>Paste Table Data Here</label>
                            <textarea
                                className="sync-textarea"
                                placeholder="Paste CricClubs table here (including player names)..."
                                value={statsPastedData}
                                onChange={(e) => setStatsPastedData(e.target.value)}
                            ></textarea>
                        </div>

                        {syncStatus.message && (
                            <div className={`sync-status ${syncStatus.type}`}>
                                {syncStatus.message}
                            </div>
                        )}

                        <div className="sync-actions">
                            <button className="btn-secondary" onClick={() => setIsSyncModalOpen(false)}>Cancel</button>
                            <button
                                className="btn-primary"
                                onClick={handleSyncSubmit}
                                disabled={syncLoading}
                            >
                                {syncLoading ? 'Syncing...' : 'Update Stats'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
