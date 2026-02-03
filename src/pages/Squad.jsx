import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';
import { Flame, Users, Globe, ChevronDown } from 'lucide-react';
import './Squad.css';

const Squad = () => {
    const [players, setPlayers] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlayers = async () => {
            if (!supabase) {
                setLoading(false);
                return;
            }

            const { data } = await supabase
                .from('squad')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (data) {
                setPlayers(data);
            }
            setLoading(false);
        };

        fetchPlayers();
    }, []);

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const topPerformers = players.slice(0, 7);
    const remainingPlayers = players.slice(7);

    return (
        <div className="page-squad">
            <Helmet>
                <title>The Squad | TuS Cricket Pfarrkirchen</title>
                <meta name="description" content="Meet the TuS Cricket Pfarrkirchen squad — players, leaders, and the community that makes us stronger." />
                <link rel="canonical" href="https://tus-cricket-pfarrkirchen.de/squad" />
            </Helmet>

            <main className="section-padding">
                <div className="container text-center">
                    <h2 className="mb-4">Meet The Squad</h2>

                    {/* Team Photos */}
                    <div className="team-photos-grid">
                        <img
                            src="/team/team-group.jpg"
                            alt="TUS Cricket Team Group"
                            className="team-photo"
                        />
                        <img
                            src="/team/team-lineup.jpg"
                            alt="TUS Cricket Team Lineup"
                            className="team-photo"
                        />
                    </div>

                    {/* Top Performers Section */}
                    {loading ? (
                        <div className="squad-loading">Loading squad...</div>
                    ) : players.length > 0 ? (
                        <>
                            <div className="section-header">
                                <h3>2026 Season Leaders</h3>
                                <p>Our top performers this season</p>
                            </div>

                            <div className="players-grid">
                                {topPerformers.map((player, index) => (
                                    <div key={player.id} className="player-card glass shadow-sm">
                                        <div className="player-avatar-container">
                                            {player.photo_url ? (
                                                <img src={player.photo_url} alt={player.name} className="player-avatar" />
                                            ) : (
                                                <div className="player-avatar-placeholder">
                                                    {getInitials(player.name)}
                                                </div>
                                            )}
                                            {index < 3 && <div className="player-badge">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</div>}
                                        </div>
                                        <div className="player-info">
                                            <h4 className="player-name">{player.name}</h4>
                                            <div className="player-stats">
                                                <div className="stat-item">
                                                    <span className="stat-value">--</span>
                                                    <span className="stat-label">Runs</span>
                                                </div>
                                                <div className="stat-item">
                                                    <span className="stat-value">--</span>
                                                    <span className="stat-label">Wickets</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {remainingPlayers.length > 0 && !isExpanded && (
                                <button className="show-more-btn" onClick={() => setIsExpanded(true)}>
                                    View Full Squad <ChevronDown size={20} />
                                </button>
                            )}

                            {isExpanded && remainingPlayers.length > 0 && (
                                <div className="expanded-roster">
                                    <div className="players-grid">
                                        {remainingPlayers.map((player) => (
                                            <div key={player.id} className="player-card glass shadow-sm">
                                                <div className="player-avatar-container">
                                                    {player.photo_url ? (
                                                        <img src={player.photo_url} alt={player.name} className="player-avatar" />
                                                    ) : (
                                                        <div className="player-avatar-placeholder">
                                                            {getInitials(player.name)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="player-info">
                                                    <h4 className="player-name">{player.name}</h4>
                                                    <div className="player-stats">
                                                        <div className="stat-item">
                                                            <span className="stat-value">--</span>
                                                            <span className="stat-label">Runs</span>
                                                        </div>
                                                        <div className="stat-item">
                                                            <span className="stat-value">--</span>
                                                            <span className="stat-label">Wickets</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="empty-state">
                            <p>Squad roster will be displayed once players are added to the database.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Squad;
