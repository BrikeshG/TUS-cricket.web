import { Facebook, Instagram } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer-minimal">
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap'
            }}>
                <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.8)' }}>
                    &copy; {new Date().getFullYear()} TUS Cricket Pfarrkirchen.
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <a
                        href="https://www.instagram.com/pfarrkirchen_cricket/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'rgba(255, 255, 255, 0.8)', display: 'flex' }}
                        className="social-icon-link"
                    >
                        <Instagram size={20} />
                    </a>
                    <a
                        href="https://www.facebook.com/profile.php?id=61572521937073"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'rgba(255, 255, 255, 0.8)', display: 'flex' }}
                        className="social-icon-link"
                    >
                        <Facebook size={20} />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
