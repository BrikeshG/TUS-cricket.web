import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Flame, Users, Globe } from 'lucide-react';

import './Team.css';

const Team = () => {
    return (
        <div className="page-team">
            <Helmet>
                <title>Team | TuS Cricket Pfarrkirchen</title>
                <meta name="description" content="Meet the TuS Cricket Pfarrkirchen squad — a cricket department of TuS 1860 Pfarrkirchen e.V." />

                {/* Open Graph */}
                <meta property="og:title" content="Team | TuS Cricket Pfarrkirchen" />
                <meta property="og:description" content="Meet the TuS Cricket Pfarrkirchen squad." />
                <meta property="og:image" content="https://tus-cricket-pfarrkirchen.de/team/team-group.jpg" />
                <meta property="og:url" content="https://tus-cricket-pfarrkirchen.de/team" />
            </Helmet>
            <main className="section-padding">
                <div className="container text-center reveal">
                    <h2 className="mb-4">Meet The Squad</h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2rem',
                        marginBottom: '4rem',
                        alignItems: 'center'
                    }}>
                        <img
                            src="/team/team-group.jpg"
                            alt="TUS Cricket Team Group"
                            className="reveal delay-1"
                            style={{
                                borderRadius: 'var(--radius-lg)',
                                boxShadow: 'var(--shadow-lg)',
                                width: '100%',
                                objectFit: 'cover'
                            }}
                        />
                        <img
                            src="/team/team-lineup.jpg"
                            alt="TUS Cricket Team Lineup"
                            className="reveal delay-2"
                            style={{
                                borderRadius: 'var(--radius-lg)',
                                boxShadow: 'var(--shadow-lg)',
                                width: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    </div>

                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <h3 className="team-heading">More Than Just A Team</h3>
                        <p className="team-intro-text">
                            Starting as a small group of passionate students, we've evolved into Pfarrkirchen's most exciting sports community. We play for the badge, but we stay for the friendships.
                        </p>

                        <div className="team-values-grid">
                            <div className="team-value-card glass shadow-sm">
                                <div style={{ color: 'var(--color-accent)', display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                    <Flame size={48} strokeWidth={1.5} />
                                </div>
                                <h4 style={{ marginBottom: '1rem' }}>Driven by Passion</h4>
                                <p style={{ fontSize: '1rem' }}>
                                    We bring high energy, student led leadership, and a competitive spirit to every single training session and league match.
                                </p>
                            </div>

                            <div className="team-value-card glass shadow-sm">
                                <div style={{ color: 'var(--color-accent)', display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                    <Users size={48} strokeWidth={1.5} />
                                </div>
                                <h4 style={{ marginBottom: '1rem' }}>Women’s Cricket</h4>
                                <p style={{ fontSize: '1rem' }}>
                                    We’re building our women’s cricket team step by step. If you’re interested, join us and be part of something new.
                                </p>
                            </div>

                            <div className="team-value-card glass shadow-sm">
                                <div style={{ color: 'var(--color-accent)', display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                    <Globe size={48} strokeWidth={1.5} />
                                </div>
                                <h4 style={{ marginBottom: '1rem' }}>Globally Diverse</h4>
                                <p style={{ fontSize: '1rem' }}>
                                    Our squad represents cultures from all over the world. We unite under one goal: to grow cricket in Bavaria.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Team;
