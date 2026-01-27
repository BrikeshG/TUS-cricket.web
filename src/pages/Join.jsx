import React from 'react';
import { Helmet } from 'react-helmet-async';
import JoinForm from '../components/JoinForm';

const Join = () => {
    return (
        <div className="page-join">
            <Helmet>
                <title>Join Us | TuS Cricket Pfarrkirchen</title>
                <meta name="description" content="Join TuS Cricket Pfarrkirchen in Pfarrkirchen, Bavaria. Beginners, students, and experienced players welcome." />

                {/* Open Graph */}
                <meta property="og:title" content="Join Us | TuS Cricket Pfarrkirchen" />
                <meta property="og:description" content="Join TuS Cricket Pfarrkirchen in Pfarrkirchen, Bavaria. Beginners welcome!" />
                <meta property="og:image" content="https://tus-cricket-pfarrkirchen.de/logo.png" />
                <meta property="og:url" content="https://tus-cricket-pfarrkirchen.de/join" />
            </Helmet>
            <main className="section-padding">
                <div className="container">
                    <div className="text-center reveal" style={{ marginBottom: '3rem' }}>
                        <h1 className="mb-2" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '800' }}>Join the Squad</h1>
                        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>
                            Take your game to the next level with TUS Cricket Club.
                        </p>

                        <div className="fade-in delay-1" style={{
                            display: 'inline-block',
                            background: '#effdf5',
                            color: '#047857',
                            padding: '10px 24px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '1rem',
                            fontWeight: '600',
                            marginTop: '1.5rem',
                            border: '1px solid #d1fae5',
                        }}>
                            ✨ First session is completely FREE!
                        </div>
                    </div>

                    <div className="reveal delay-2" style={{
                        maxWidth: '700px',
                        margin: '0 auto',
                    }}>
                        <JoinForm />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Join;
