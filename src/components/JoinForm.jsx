import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './JoinForm.css';

const JoinForm = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.target);
        const data = new URLSearchParams(formData).toString();

        try {
            const response = await fetch("/", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: data,
            });

            if (response.ok) {
                navigate("/success");
            } else {
                alert(`Something went wrong. (Error ${response.status})`);
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Form error:", error);
            alert("Submission error. Please check your connection.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="join-form-container">
            <form
                className="join-form"
                name="join-form"
                method="POST"
                data-netlify="true"
                onSubmit={handleSubmit}
            >
                {/* Netlify Forms Configuration */}
                <input type="hidden" name="form-name" value="join-form" />
                <input type="hidden" name="subject" value="New Player Application via Website" />

                <div className="form-grid">
                    <div className="form-group full-width">
                        <label htmlFor="name" className="form-label">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            placeholder="John Doe"
                            className="form-input"
                        />
                    </div>

                    <div className="form-group full-width">
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            placeholder="john@example.com"
                            className="form-input"
                        />
                    </div>

                    <div className="form-group full-width">
                        <label htmlFor="phone" className="form-label">Phone Number</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            placeholder="+49 123 45678"
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role" className="form-label">Preferred Role</label>
                        <select
                            id="role"
                            name="role"
                            className="form-select"
                        >
                            <option>Batsman</option>
                            <option>Bowler (Fast)</option>
                            <option>Bowler (Spin)</option>
                            <option>All-Rounder</option>
                            <option>Wicket Keeper</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="experience" className="form-label">Experience Level</label>
                        <select
                            id="experience"
                            name="experience"
                            className="form-select"
                        >
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Pro</option>
                        </select>
                    </div>

                    <div className="form-group full-width">
                        <label htmlFor="message" className="form-label">Additional Notes</label>
                        <textarea
                            id="message"
                            name="message"
                            rows="6"
                            placeholder="Tell us a bit about your cricketing journey..."
                            className="form-textarea"
                        ></textarea>
                    </div>
                </div>

                <div className="form-footer">
                    <button
                        type="submit"
                        className="btn btn-primary btn-large"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Sending...' : 'Send Application'}
                    </button>
                    <p className="form-disclaimer">By clicking send, you agree to our privacy policy.</p>
                </div>
            </form>
        </div>
    );
};

export default JoinForm;
