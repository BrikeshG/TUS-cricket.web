import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';
import { Flame, Users, Globe, ChevronDown } from 'lucide-react';
import './Squad.css';


const Squad = () => {
    const [players, setPlayers] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    const teamPhotos = [
        { src: '/team/team-lineup.jpg', alt: 'TUS Cricket Team Lineup' },
        { src: '/team/team-group.jpg', alt: 'TUS Cricket Team Group' },
        { src: '/team/team-dinner.jpg', alt: 'TUS Cricket Team Dinner' }
    ];

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

    const nextPhoto = () => {
        setCurrentPhotoIndex((prev) => (prev + 1) % teamPhotos.length);
    };

    const goToPhoto = (index) => {
        setCurrentPhotoIndex(index);
    };

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

                    {/* Team Photos Carousel */}
                    <div className="team-carousel">
                        <div className="carousel-container" onClick={nextPhoto}>
                            {teamPhotos.map((photo, index) => (
                                <img
                                    key={index}
                                    src={photo.src}
                                    alt={photo.alt}
                                    className={`carousel-photo ${index === currentPhotoIndex ? 'active' : ''}`}
                                />
                            ))}
                        </div>
                        <div className="carousel-dots">
                            {teamPhotos.map((_, index) => (
                                <button
                                    key={index}
                                    className={`dot ${index === currentPhotoIndex ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        goToPhoto(index);
                                    }}
                                    aria-label={`Go to photo ${index + 1}`}
                                />
                            ))}
                        </div>
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
                                                    <span className="stat-value">{player.total_runs || 0}</span>
                                                    <span className="stat-label">Runs</span>
                                                </div>
                                                <div className="stat-item">
                                                    <span className="stat-value">{player.total_wickets || 0}</span>
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
                                                            <span className="stat-value">{player.total_runs || 0}</span>
                                                            <span className="stat-label">Runs</span>
                                                        </div>
                                                        <div className="stat-item">
                                                            <span className="stat-value">{player.total_wickets || 0}</span>
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
