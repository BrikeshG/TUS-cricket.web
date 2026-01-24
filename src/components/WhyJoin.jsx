import React from 'react';
import './WhyJoin.css';

const BenefitCard = ({ title, description, icon }) => (
    <div className="benefit-card">
        <div className="benefit-icon">{icon}</div>
        <div className="benefit-content">
            <h3 className="benefit-title">{title}</h3>
            <p className="benefit-desc">{description}</p>
        </div>
    </div>
);

const WhyJoin = () => {
    const benefits = [
        {
            title: "Built by Students",
            description: "Started by students, driven by passion. Fresh energy and strong teamwork.",
            icon: "⚡"
        },
        {
            title: "More Than Cricket",
            description: "Not just matches — it’s memories. We train, laugh, and enjoy the journey.",
            icon: "✨"
        },
        {
            title: "Everyone Welcome",
            description: "Beginner or pro, you belong here. A team that supports you like family.",
            icon: "🧡"
        }
    ];

    return (
        <section className="section why-join">
            <div className="container">
                <div className="section-header text-center">
                    <h2 className="section-title">Why Play for TUS?</h2>
                    <p className="section-subtitle">We build cricketers, not just teams.</p>
                </div>
                <div className="benefits-grid">
                    {benefits.map((benefit, index) => (
                        <BenefitCard key={index} {...benefit} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyJoin;
