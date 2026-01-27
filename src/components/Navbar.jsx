import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar ${scrolled ? 'scrolled glass' : ''}`}>
            <div className="container navbar-container">
                <NavLink to="/" className="navbar-logo">
                    <img src="/logo.png" alt="TUS Cricket Logo" className="logo-img" />
                    <span className="logo-text">TUS Cricket</span>
                </NavLink>

                {/* Desktop Menu */}
                <div className="navbar-links">
                    <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>
                    <NavLink to="/team" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Team</NavLink>
                    <NavLink to="/join" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Join Us</NavLink>
                    <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Contact</NavLink>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="mobile-toggle"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle Menu"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Mobile Menu */}
                <div className={`mobile-menu glass ${isOpen ? 'active' : ''}`}>
                    <NavLink to="/" onClick={() => setIsOpen(false)} className="mobile-nav-link">Home</NavLink>
                    <NavLink to="/team" onClick={() => setIsOpen(false)} className="mobile-nav-link">Team</NavLink>
                    <NavLink to="/join" onClick={() => setIsOpen(false)} className="mobile-nav-link">Join Us</NavLink>
                    <NavLink to="/contact" onClick={() => setIsOpen(false)} className="mobile-nav-link">Contact</NavLink>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
