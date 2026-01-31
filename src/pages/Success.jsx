import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import './Success.css';

const Success = () => {
    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="page-wrapper">
            <Helmet>
                <title>Message Sent | TuS Cricket</title>
                <meta name="robots" content="noindex" />
            </Helmet>
            <main className="success-page">
                <div className="success-card">
                    <div className="success-icon-wrapper">
                        <CheckCircle size={48} color="var(--color-primary-dark)" strokeWidth={2.5} />
                    </div>
                    <h1 className="success-title">Application Received!</h1>
                    <p className="success-message">
                        Thanks for joining the squad! <br />
                        We have received your details and will get back to you shortly with training schedules.
                    </p>
                    <Link to="/" className="btn btn-primary">
                        Back to Home
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default Success;
