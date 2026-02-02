import React from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '../components/Hero';
import './Home.css';

const Home = () => {
    return (
        <div className="page-home">
            <Helmet>
                <title>TuS Cricket | Cricket Club in Pfarrkirchen</title>
                <meta name="description" content="Official cricket department of TuS 1860 Pfarrkirchen e.V. Indoor winter training and summer league matches (T20 + 50 overs Verbandsliga). Beginners and students welcome." />
                <link rel="canonical" href="https://tus-cricket-pfarrkirchen.de/" />

                {/* Open Graph */}
                <meta property="og:title" content="TuS Cricket Pfarrkirchen | Cricket Club in Pfarrkirchen" />
                <meta property="og:description" content="Official cricket department of TuS 1860 Pfarrkirchen e.V. Indoor winter training and summer league matches." />
                <meta property="og:image" content="https://tus-cricket-pfarrkirchen.de/logo.png" />
                <meta property="og:url" content="https://tus-cricket-pfarrkirchen.de/" />
                <meta property="og:type" content="website" />

                <script type="application/ld+json">
                    {`
                    {
                      "@context": "https://schema.org",
                      "@type": "SportsClub",
                      "name": "TuS Cricket Pfarrkirchen",
                      "sport": "Cricket",
                      "parentOrganization": {
                        "@type": "SportsOrganization",
                        "name": "Turn- und Spielvereinigung 1860 Pfarrkirchen e.V."
                      },
                      "url": "https://tus-cricket-pfarrkirchen.de/",
                      "address": {
                        "@type": "PostalAddress",
                        "addressLocality": "Pfarrkirchen",
                        "addressRegion": "Bavaria",
                        "addressCountry": "DE"
                      }
                    }
                    `}
                </script>
            </Helmet>
            <main>
                <Hero />

                <section className="section-padding">
                    <div className="container">
                        <div className="trial-cta-container reveal delay-1">
                            <a href="/join" className="trial-cta-button">
                                <p className="trial-cta-text">
                                    <span className="trial-cta-icon">✨</span>
                                    Beginner? Come for a FREE trial session!
                                </p>
                            </a>
                        </div>

                        <div className="grid-training">
                            {/* Winter / Indoor */}
                            <div className="glass shadow-md training-card reveal delay-3">
                                <div className="training-icon">❄️</div>
                                <h3 className="training-title">Training (Winter – Indoor)</h3>
                                <ul style={{ listStyle: 'none' }}>
                                    <li><strong>Saturday:</strong> 12:00 – 16:00</li>
                                    <li><strong>Sunday:</strong> 10:00 – 15:00</li>
                                </ul>
                            </div>

                            {/* Summer / Outdoor */}
                            <div className="glass shadow-md training-card reveal delay-5">
                                <div className="training-icon">☀️</div>
                                <h3 className="training-title">Summer Season</h3>
                                <p>
                                    We play T20 and 50 overs in the <strong className="text-accent">Verbandsliga</strong>.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>


                {/* Cricket Excellence Section - 2 Column Layout */}
                <section className="skyline-section">
                    <div className="container">
                        <div className="skyline-grid">
                            {/* Left - Skyline Image */}
                            <div className="skyline-image-container">
                                <img
                                    src="/pfarrkirchen-skyline.png"
                                    alt="Pfarrkirchen"
                                    className="skyline-image"
                                />
                            </div>

                            {/* Right - Content */}
                            <div className="skyline-content">
                                <h2>
                                    Cricket at TuS 1860 e.V. Pfarrkirchen
                                </h2>
                                <p>
                                    TuS 1860 e.V. Pfarrkirchen is a historic multi-sport club deeply rooted in the local community.
                                    As a proud department of this club, we uphold its core values—discipline, respect, and teamwork—while
                                    fostering a dynamic and competitive cricket culture in Pfarrkirchen. We offer structured training,
                                    intense league competition, and dedicated support for player development at all levels. If you seek
                                    consistent cricket, unwavering team spirit, and the honor of representing TuS 1860 e.V., you have
                                    found your home.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Home;
