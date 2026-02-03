import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import './Mappings.css';

const Mappings = () => {
    const [mappings, setMappings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [sourceName, setSourceName] = useState('');
    const [targetName, setTargetName] = useState('');

    useEffect(() => {
        loadMappings();
    }, []);

    const loadMappings = async () => {
        if (!supabase) return;

        const { data, error } = await supabase
            .from('mappings')
            .select('*')
            .order('source_name');

        if (!error && data) {
            setMappings(data);
        }
        setLoading(false);
    };

    const handleAddMapping = async (e) => {
        e.preventDefault();
        if (!sourceName.trim() || !targetName.trim()) return;

        const { error } = await supabase
            .from('mappings')
            .insert([{
                source_name: sourceName.trim(),
                target_name: targetName.trim()
            }]);

        if (!error) {
            setSourceName('');
            setTargetName('');
            setShowAddModal(false);
            loadMappings();
        }
    };

    const handleDeleteMapping = async (id) => {
        if (!confirm('Are you sure you want to delete this mapping?')) return;

        const { error } = await supabase
            .from('mappings')
            .delete()
            .eq('id', id);

        if (!error) {
            loadMappings();
        }
    };

    const handleSyncStats = async () => {
        setSyncing(true);
        try {
            const response = await fetch('/.netlify/functions/trigger-stats-update', {
                method: 'POST'
            });
            const result = await response.json();

            if (result.success) {
                alert(`Stats updated successfully! ${result.playersUpdated} players updated.`);
            } else {
                alert('Error updating stats. Check console for details.');
            }
        } catch (error) {
            console.error('Error syncing stats:', error);
            alert('Error syncing stats. Make sure you are deployed to Netlify.');
        }
        setSyncing(false);
    };

    return (
        <div className="mappings-page">
            <Helmet>
                <title>Name Mappings | Admin</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="mappings-header">
                <div>
                    <h2>CricClubs Name Mappings</h2>
                    <p>Map CricClubs player names to your official squad names</p>
                </div>
                <div className="header-actions">
                    <button onClick={handleSyncStats} className="sync-btn" disabled={syncing}>
                        <RefreshCw size={18} className={syncing ? 'spinning' : ''} />
                        {syncing ? 'Syncing...' : 'Sync Stats Now'}
                    </button>
                    <button onClick={() => setShowAddModal(true)} className="add-btn">
                        <Plus size={18} /> Add Mapping
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading mappings...</div>
            ) : (
                <div className="mappings-table-container">
                    <table className="mappings-table">
                        <thead>
                            <tr>
                                <th>CricClubs Name</th>
                                <th>→</th>
                                <th>Squad Name</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mappings.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="empty-state">
                                        No mappings yet. Add a mapping to link CricClubs names to your squad.
                                    </td>
                                </tr>
                            ) : (
                                mappings.map((mapping) => (
                                    <tr key={mapping.id}>
                                        <td className="source-name">{mapping.source_name}</td>
                                        <td className="arrow">→</td>
                                        <td className="target-name">{mapping.target_name}</td>
                                        <td>
                                            <button
                                                onClick={() => handleDeleteMapping(mapping.id)}
                                                className="delete-btn"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Mapping Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Add Name Mapping</h3>
                        <form onSubmit={handleAddMapping}>
                            <div className="form-group">
                                <label htmlFor="sourceName">CricClubs Name</label>
                                <input
                                    type="text"
                                    id="sourceName"
                                    value={sourceName}
                                    onChange={(e) => setSourceName(e.target.value)}
                                    placeholder="e.g., Brikesh Vikin Gowrish"
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="targetName">Squad Name</label>
                                <input
                                    type="text"
                                    id="targetName"
                                    value={targetName}
                                    onChange={(e) => setTargetName(e.target.value)}
                                    placeholder="e.g., Brikesh Gowrish"
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowAddModal(false)} className="cancel-btn">
                                    Cancel
                                </button>
                                <button type="submit" className="submit-btn">
                                    Add Mapping
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Mappings;
