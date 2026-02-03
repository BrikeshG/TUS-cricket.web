import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';
import { Flame, Users, Globe, ChevronDown, Trophy, Medal, Star } from 'lucide-react';
import './Squad.css';

const Squad = () => {
    const [players, setPlayers] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!supabase) {
                setLoading(false);
                return;
            }

            // Fetch Seasons
            const { data: seasonsData } = await supabase
                .from('seasons')
                .select('*')
                .order('year', { ascending: false });

            if (seasonsData) {
                setSeasons(seasonsData);
                setSelectedSeason(seasonsData[0]);
            }

            // Fetch Players (Squad)
            // Note: We'll imagine they are sorted by a performance score for this layout
            const { data: playersData } = await supabase
                .from('squad')
                .select('*')
                .eq('is_active', true)
                .order('name'); // Default sort for now

            if (playersData) {
                setPlayers(playersData);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // If no players yet, we'll show a nice empty state
    const hasPlayers = players.length > 0;
    const topPerformer = hasPlayers ? players[0] : null;
    const leaders = hasPlayers ? players.slice(1, 7) : [];
    const remainingPlayers = hasPlayers ? players.slice(7) : [];

    if (loading) return <div className="squad-loading">Refining the lineup...</div>;

    return (
        <div className="squad-page">
            <Helmet>
                <title>The Squad | TuS Cricket Pfarrkirchen</title>
                <meta name="description" content="Meet the athletes and top performers of TuS Cricket Pfarrkirchen. Leaders, legends, and the full team roster." />
                <link rel="canonical" href="https://tus-cricket-pfarrkirchen.de/squad" />
            </Helmet>

            {/* Premium Header */}
            <header className="squad-hero">
                <div className="container hero-container">
                    <div className="hero-badge">2026 Season</div>
                    <h1 className="squad-hero-title">The Squad</h1>
                    <p className="squad-hero-subtitle">
                        Where elite performance meets a community that plays for the badge.
                    </p>
                    {seasons.length > 1 && (
                        <div className="season-pills">
                            {seasons.map(s => (
                                <button
                                    key={s.id}
                                    className={`pill ${selectedSeason?.id === s.id ? 'active' : ''}`}
                                    onClick={() => setSelectedSeason(s)}
                                >
                                    {s.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </header>

            <main className="container squad-content">
                {hasPlayers ? (
                    <>
                        {/* 1. Spotlight Section (Rank #1) */}
                        <section className="spotlight-section">
                            <div className="spotlight-label">
                                <Trophy size={18} /> Season Spotlight
                            </div>
                            <div className="spotlight-card">
                                <div className="spotlight-img">
                                    {topPerformer.photo_url ? (
                                        <img src={topPerformer.photo_url} alt={topPerformer.name} />
                                    ) : (
                                        <div className="spotlight-placeholder">{getInitials(topPerformer.name)}</div>
                                    )}
                                    <div className="rank-badge">#1</div>
                                </div>
                                <div className="spotlight-info">
                                    <h2 className="spotlight-name">{topPerformer.name}</h2>
                                    <div className="spotlight-tags">
                                        <span className="tag">TOP PERFORMER</span>
                                        <span className="tag-outline">MVP CANDIDATE</span>
                                    </div>
                                    <div className="spotlight-stats-preview">
                                        <div className="mini-stat">
                                            <span className="val">Rank 1</span>
                                            <span className="lab">Elite Performance</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. Elite Board (Rank #2 - Rank #7) */}
                        <section className="leaders-section">
                            <h3 className="section-label">Top Performers</h3>
                            <div className="leaders-grid">
                                {leaders.map((player, index) => (
                                    <div key={player.id} className="leader-card">
                                        <div className="leader-img">
                                            {player.photo_url ? (
                                                <img src={player.photo_url} alt={player.name} />
                                            ) : (
                                                <div className="leader-placeholder">{getInitials(player.name)}</div>
                                            )}
                                            <div className="leader-rank">{index + 2}</div>
                                        </div>
                                        <div className="leader-body">
                                            <h4 className="leader-name">{player.name}</h4>
                                            <div className="leader-medal">
                                                <Medal size={14} /> Active Squad
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 3. Full Roster (Hidden by default) */}
                        {remainingPlayers.length > 0 && (
                            <section className="roster-section">
                                {!isExpanded ? (
                                    <button className="expand-btn" onClick={() => setIsExpanded(true)}>
                                        View Full Roster <ChevronDown size={20} />
                                    </button>
                                ) : (
                                    <div className="full-roster-reveal">
                                        <h3 className="section-label">Team Members</h3>
                                        <div className="roster-grid">
                                            {remainingPlayers.map(player => (
                                                <div key={player.id} className="roster-card">
                                                    <div className="roster-avatar">
                                                        {player.photo_url ? (
                                                            <img src={player.photo_url} alt={player.name} />
                                                        ) : (
                                                            <div className="roster-initials">{getInitials(player.name)}</div>
                                                        )}
                                                    </div>
                                                    <div className="roster-info">
                                                        <div className="roster-name">{player.name}</div>
                                                        <div className="roster-status">Club Member</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}
                    </>
                ) : (
                    <div className="squad-empty">
                        <Star size={48} className="empty-icon" />
                        <h2>Squad Coming Soon</h2>
                        <p>We are currently finalizing the season roster. Stay tuned!</p>
                    </div>
                )}

                {/* 4. Club Identity (Combined from Team Page) */}
                <section className="identity-section">
                    <div className="identity-header">
                        <h2>More Than Just A Team</h2>
                        <p>Starting as a group of passionate students, we've evolved into Pfarrkirchen's most exciting sports community.</p>
                    </div>
                    <div className="identity-grid">
                        <div className="id-card">
                            <Flame className="id-icon" />
                            <h4>Driven by Passion</h4>
                            <p>Student-led leadership and competitive spirit in every match.</p>
                        </div>
                        <div className="id-card">
                            <Users className="id-icon" />
                            <h4>Women’s Cricket</h4>
                            <p>Building a future for everyone. Join our growing women’s initiative.</p>
                        </div>
                        <div className="id-card">
                            <Globe className="id-icon" />
                            <h4>Globally Diverse</h4>
                            <p>Representing cultures from around the world under one goal.</p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Squad;
