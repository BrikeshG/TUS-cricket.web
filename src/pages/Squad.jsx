import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import './Squad.css';

const Squad = () => {
    // Determine default season based on current date
    // Cricket season typically starts in April
    const getCurrentSeason = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth(); // 0-indexed (0 = January, 3 = April)

        // If it's April (month 3) or later in 2026, show 2026 season
        if (year === 2026 && month >= 3) {
            return '2026';
        }
        // If it's 2027 or later, show the current year
        if (year >= 2027) {
            return year.toString();
        }
        // Otherwise, show 2025
        return '2025';
    };

    const [players, setPlayers] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [selectedSeason, setSelectedSeason] = useState(getCurrentSeason());
    const [showPointsInfo, setShowPointsInfo] = useState(false);

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

            setLoading(true);

            // Fetch squad and per-season stats in parallel
            try {
                const [{ data: squadMembers }, { data: statsRecords }] = await Promise.all([
                    supabase.from('squad').select('*').eq('is_active', true),
                    supabase.from('player_stats').select('*').eq('season', parseInt(selectedSeason))
                ]);

                if (squadMembers) {
                    const playersWithStats = squadMembers.map(player => {
                        const playerStats = statsRecords?.filter(s => s.player_name === player.name) || [];
                        const t20 = playerStats.find(s => s.format === 'T20') || {};
                        const fifty = playerStats.find(s => s.format === 'Fifty') || {};

                        return {
                            ...player,
                            total_runs: (t20.runs || 0) + (fifty.runs || 0),
                            total_wickets: (t20.wickets || 0) + (fifty.wickets || 0),
                            total_catches: (t20.catches || 0) + (fifty.catches || 0),
                            total_matches: (t20.matches || 0) + (fifty.matches || 0)
                        };
                    });

                    // Sort by points within the season data
                    playersWithStats.sort((a, b) => calculatePoints(b) - calculatePoints(a));
                    setPlayers(playersWithStats);
                }
            } catch (err) {
                console.error("Error fetching squad data:", err);
            }
            setLoading(false);
        };

        fetchPlayers();
    }, [selectedSeason]);


    const nextPhoto = () => {
        setCurrentPhotoIndex((prev) => (prev + 1) % teamPhotos.length);
    };

    const goToPhoto = (index) => {
        setCurrentPhotoIndex(index);
    };

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatName = (name) => {
        const parts = name.split(' ');
        if (parts.length === 1) return { first: '', last: name.toUpperCase() };
        const last = parts.pop();
        const first = parts.join(' ');
        return { first, last: last.toUpperCase() };
    };

    const getRole = (player) => {
        const runs = player.total_runs || 0;
        const wickets = player.total_wickets || 0;
        if (runs > 100 && wickets > 5) return 'All-Rounder';
        if (wickets > runs / 20) return 'Bowler';
        return 'Batsman';
    };

    // Calculate overall points: 1 point per run, 20 points per wicket, 10 points per catch
    const calculatePoints = (player) => {
        const runs = player.total_runs || 0;
        const wickets = player.total_wickets || 0;
        const catches = player.total_catches || 0;
        return runs + (wickets * 20) + (catches * 5);
    };

    // Sort players by overall points
    const rankedPlayers = [...players].sort((a, b) => calculatePoints(b) - calculatePoints(a));
    const displayedPlayers = isExpanded ? rankedPlayers : rankedPlayers.slice(0, 6);
    const hasMorePlayers = rankedPlayers.length > 6;

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

                    {/* Rankings Table */}
                    {loading ? (
                        <div className="squad-loading">Loading squad...</div>
                    ) : players.length > 0 ? (
                        <div className="rankings-section">
                            <div className="rankings-header">
                                <h3>{selectedSeason} Season Rankings</h3>
                                <div className="season-selector">
                                    <select
                                        id="season"
                                        value={selectedSeason}
                                        onChange={(e) => setSelectedSeason(e.target.value)}
                                        className="season-dropdown"
                                    >
                                        <option value="2025">2025</option>
                                        <option value="2026">2026</option>
                                    </select>
                                </div>
                            </div>

                            {selectedSeason === '2026' ? (
                                <div className="season-coming-soon">
                                    <div className="coming-soon-content">
                                        <span className="coming-soon-icon">🏏</span>
                                        <h4>2026 Season Starting Soon!</h4>
                                        <p>Stats will be available once the season begins. Check back soon!</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="rankings-table">
                                    {/* Table Header */}
                                    <div className="rankings-table-header">
                                        <div className="col-pos">POS</div>
                                        <div className="col-role">ROLE</div>
                                        <div className="col-player">Player</div>
                                        <div className="col-runs">Runs</div>
                                        <div className="col-wickets">Wkts</div>
                                        <div className="col-catches">C/ST</div>
                                        <div className="col-points">
                                            Points
                                            <span
                                                className={`points-info-trigger ${showPointsInfo ? 'active' : ''}`}
                                                onClick={() => setShowPointsInfo(!showPointsInfo)}
                                            >
                                                <Info size={14} />
                                                <span className={`points-tooltip ${showPointsInfo ? 'visible' : ''}`}>
                                                    Points = Runs + (Wickets × 20) + (Catches × 5)
                                                </span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Player Rows */}
                                    {displayedPlayers.map((player, index) => {
                                        const { first, last } = formatName(player.name);
                                        const isTop = index === 0;
                                        const role = getRole(player);

                                        return (
                                            <div
                                                key={player.id}
                                                className={`rankings-row ${isTop ? 'top-player' : ''}`}
                                            >
                                                <div className="col-pos">
                                                    <span className="pos-number">
                                                        {String(index + 1).padStart(2, '0')}
                                                    </span>
                                                    <span className="pos-dot"></span>
                                                </div>

                                                <div className="col-role">
                                                    <span className={`role-badge ${role.toLowerCase().replace('-', '')}`}>
                                                        {role}
                                                    </span>
                                                </div>

                                                <div className="col-player">
                                                    {isTop && (
                                                        <div className="player-photo-container">
                                                            {player.photo_url ? (
                                                                <img
                                                                    src={player.photo_url}
                                                                    alt={player.name}
                                                                    className="player-photo"
                                                                />
                                                            ) : (
                                                                <div className="player-photo-placeholder">
                                                                    {getInitials(player.name)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="player-name-container">
                                                        <span className="name-first">{first}</span>
                                                        <span className="name-last">{last}</span>
                                                    </div>
                                                </div>

                                                <div className="col-runs">
                                                    <span className="stat-value">{player.total_runs || 0}</span>
                                                </div>

                                                <div className="col-wickets">
                                                    <span className="stat-value">{player.total_wickets || 0}</span>
                                                </div>

                                                <div className="col-catches">
                                                    <span className="stat-value">{player.total_catches || 0}</span>
                                                </div>

                                                <div className="col-points">
                                                    <span className="stat-value points-value">{calculatePoints(player)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Show More / Show Less Button - only show for 2025 */}
                            {selectedSeason === '2025' && hasMorePlayers && (
                                <button
                                    className="show-more-btn"
                                    onClick={() => setIsExpanded(!isExpanded)}
                                >
                                    {isExpanded ? (
                                        <>Show Less <ChevronUp size={20} /></>
                                    ) : (
                                        <>Show More ({rankedPlayers.length - 6} more) <ChevronDown size={20} /></>
                                    )}
                                </button>
                            )}

                            {/* Stats Update Info - only show for 2025 */}
                            {selectedSeason === '2025' && players.some(p => p.last_stats_update) && (
                                <div className="stats-update-info">
                                    <p>Stats last updated: {new Date(players.find(p => p.last_stats_update).last_stats_update).toLocaleDateString()} from CricClubs</p>
                                </div>
                            )}
                        </div>
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

