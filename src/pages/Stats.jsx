import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';
import './Stats.css';

const Stats = () => {
    const [players, setPlayers] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch seasons on mount
    useEffect(() => {
        const fetchSeasons = async () => {
            if (!supabase) {
                setError('Stats feature is not configured yet.');
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('seasons')
                .select('*')
                .order('year', { ascending: false });

            if (error) {
                setError('Failed to load seasons.');
                console.error(error);
            } else {
                setSeasons(data);
                if (data.length > 0) {
                    setSelectedSeason(data[0]); // Select most recent
                }
            }
            setLoading(false);
        };

        fetchSeasons();
    }, []);

    // Fetch players when season changes
    useEffect(() => {
        const fetchPlayers = async () => {
            if (!supabase || !selectedSeason) return;

            const { data, error } = await supabase
                .from('squad')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (error) {
                console.error(error);
            } else {
                setPlayers(data);
            }
        };

        fetchPlayers();
    }, [selectedSeason]);

    // Get initials for fallback avatar
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading) {
        return (
            <div className="stats-page">
                <div className="container">
                    <div className="stats-loading">Loading stats...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="stats-page">
                <div className="container">
                    <div className="stats-error">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="stats-page">
            <Helmet>
                <title>Player Stats | TuS Cricket Pfarrkirchen</title>
                <meta name="description" content="View player statistics, leaderboards, and season records for TuS Cricket Pfarrkirchen." />
                <link rel="canonical" href="https://tus-cricket-pfarrkirchen.de/stats" />
            </Helmet>

            <header className="stats-header">
                <div className="container">
                    <h1 className="stats-title">Player Statistics</h1>
                    <p className="stats-subtitle">
                        Track our players' performance across seasons
                    </p>

                    {/* Season Selector */}
                    {seasons.length > 0 && (
                        <div className="season-selector">
                            {seasons.map((season) => (
                                <button
                                    key={season.id}
                                    className={`season-btn ${selectedSeason?.id === season.id ? 'active' : ''}`}
                                    onClick={() => setSelectedSeason(season)}
                                >
                                    {season.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </header>

            <main className="stats-content">
                <div className="container">
                    {/* Highlight Cards */}
                    <section className="stats-highlights">
                        <div className="highlight-card orange-cap">
                            <div className="highlight-icon">🏏</div>
                            <div className="highlight-label">Orange Cap</div>
                            <div className="highlight-name">Top Scorer</div>
                            <div className="highlight-value">Coming Soon</div>
                        </div>
                        <div className="highlight-card purple-cap">
                            <div className="highlight-icon">💜</div>
                            <div className="highlight-label">Purple Cap</div>
                            <div className="highlight-name">Top Wickets</div>
                            <div className="highlight-value">Coming Soon</div>
                        </div>
                        <div className="highlight-card mvp">
                            <div className="highlight-icon">⭐</div>
                            <div className="highlight-label">Season MVP</div>
                            <div className="highlight-name">Most Points</div>
                            <div className="highlight-value">Coming Soon</div>
                        </div>
                    </section>

                    {/* Squad List */}
                    <section className="squad-section">
                        <h2 className="section-title">Current Squad</h2>

                        {players.length === 0 ? (
                            <div className="empty-state">
                                <p>No players added yet. Add players via the Admin Panel.</p>
                            </div>
                        ) : (
                            <div className="squad-grid">
                                {players.map((player) => (
                                    <div key={player.id} className="player-card">
                                        <div className="player-avatar">
                                            {player.photo_url ? (
                                                <img src={player.photo_url} alt={player.name} />
                                            ) : (
                                                <div className="avatar-initials">
                                                    {getInitials(player.name)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="player-name">{player.name}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Info Banner */}
                    <section className="stats-info">
                        <div className="info-card">
                            <h3>📊 Stats Coming Soon!</h3>
                            <p>
                                We're connecting to CricClubs to automatically pull match statistics.
                                Check back soon to see runs, wickets, catches, and more!
                            </p>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Stats;
