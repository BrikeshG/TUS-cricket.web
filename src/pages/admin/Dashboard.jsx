import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { signOut, getCurrentUser } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { LogOut, Plus, Edit2, Trash2, Upload } from 'lucide-react';
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

        if (!error && data) {
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

        if (!error) {
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
            .from('squad')
            .update({ is_active: !player.is_active })
            .eq('id', player.id);

        if (error) {
            console.error('Update error:', error);
            alert('Failed to update player: ' + error.message);
        } else {
            loadPlayers();
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
                    ) : (
                        <Mappings />
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
        </div>
    );
};

export default Dashboard;
