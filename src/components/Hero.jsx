import React from 'react';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero">
            <div className="hero-overlay"></div>
            <div className="container hero-container">
                <div className="hero-content fade-in">
                    <h1 className="hero-title">
                        Cricket Excellence <br />
                        <span className="text-primary">In Pfarrkirchen.</span>
                    </h1>
                    <p className="hero-subtitle delay-1">
                        Home of the official cricket department of TuS 1860 Pfarrkirchen.
                        Where tradition meets talent, and every beginner finds a home.
                    </p>
                    <div className="hero-actions delay-2">
                        <a href="/join" className="btn btn-primary">Join the Team</a>
                        <a href="/team" className="btn btn-secondary">Meet the Squad</a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
