import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Twitter, Github, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer style={styles.footer}>
            <div className="container" style={styles.container}>
                <div style={styles.grid}>
                    {/* Brand Section */}
                    <div style={styles.brandSection}>
                        <Link to="/" style={styles.logo}>
                            <Leaf style={{ color: 'var(--color-accent)' }} size={24} />
                            <span style={styles.logoText}>EcoPredict</span>
                        </Link>
                        <p style={styles.description}>
                            AI-driven platform leveraging predictive models to forecast biodiversity trends and provide actionable conservation insights.
                        </p>
                        <div style={styles.socialLinks}>
                            <a href="#" className="social-icon" style={styles.socialIcon}><Twitter size={20} /></a>
                            <a href="#" className="social-icon" style={styles.socialIcon}><Github size={20} /></a>
                            <a href="#" className="social-icon" style={styles.socialIcon}><Linkedin size={20} /></a>
                            <a href="#" className="social-icon" style={styles.socialIcon}><Mail size={20} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div style={styles.linkGroup}>
                        <h4 style={styles.groupTitle}>Platform</h4>
                        <Link to="/dashboard" style={styles.link}>Dashboard</Link>
                        <Link to="/risk-map" style={styles.link}>Risk Map</Link>
                        <Link to="/analytics" style={styles.link}>Correlation Analytics</Link>
                    </div>

                    <div style={styles.linkGroup}>
                        <h4 style={styles.groupTitle}>Data & Science</h4>
                        <Link to="#" style={styles.link}>Predictive Models</Link>
                        <Link to="#" style={styles.link}>ML Methodology</Link>
                        <Link to="#" style={styles.link}>Ecosystem Tracking</Link>
                        <Link to="#" style={styles.link}>IoT Sensor Networks</Link>
                    </div>

                    <div style={styles.linkGroup}>
                        <h4 style={styles.groupTitle}>Company</h4>
                        <Link to="/about" style={styles.link}>About Us</Link>
                        <Link to="/contact" style={styles.link}>Contact</Link>
                        <Link to="/careers" style={styles.link}>Careers</Link>
                    </div>

                    <div style={styles.linkGroup}>
                        <h4 style={styles.groupTitle}>Legal</h4>
                        <Link to="/privacy" style={styles.link}>Privacy Policy</Link>
                        <Link to="/terms" style={styles.link}>Terms of Service</Link>
                    </div>
                </div>

                <div style={styles.bottomBar}>
                    <p style={styles.copyright}>
                        &copy; {currentYear} EcoPredict. All rights reserved. Built for environmental conservation.
                    </p>
                </div>
            </div>
        </footer>
    );
};

const styles = {
    footer: {
        backgroundColor: 'var(--color-dark)',
        color: 'var(--color-beige)',
        paddingTop: '4rem',
        paddingBottom: '2rem',
        marginTop: 'auto',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        width: '100%'
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1.5rem'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '2.5rem',
        marginBottom: '3rem',
    },
    brandSection: {
        gridColumn: '1 / -1',
        maxWidth: '450px',
        marginBottom: '1rem'
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        textDecoration: 'none',
        marginBottom: '1rem',
    },
    logoText: {
        fontSize: '1.5rem',
        fontFamily: 'var(--font-display)',
        fontWeight: '700',
        color: 'var(--color-soft-white)',
        letterSpacing: '-0.5px'
    },
    description: {
        color: 'rgba(255,255,255,0.7)',
        lineHeight: '1.6',
        marginBottom: '1.5rem',
        fontSize: '0.95rem'
    },
    socialLinks: {
        display: 'flex',
        gap: '1rem',
    },
    socialIcon: {
        color: 'rgba(255,255,255,0.7)',
        transition: 'color 0.3s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.2)',
    },
    linkGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    groupTitle: {
        color: 'var(--color-soft-white)',
        fontSize: '1.1rem',
        marginBottom: '0.5rem',
        fontFamily: 'var(--font-display)',
        fontWeight: '600',
    },
    link: {
        color: 'rgba(255,255,255,0.7)',
        textDecoration: 'none',
        fontSize: '0.95rem',
        transition: 'color 0.3s',
    },
    bottomBar: {
        borderTop: '1px solid rgba(255,255,255,0.1)',
        paddingTop: '2rem',
        textAlign: 'center',
    },
    copyright: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: '0.9rem',
        margin: 0,
        fontWeight: '400'
    }
};

// Add hover effects via CSS since React inline hover is tricky
const hoverStyles = `
  footer a:hover {
    color: var(--color-accent) !important;
  }
  footer .social-icon:hover {
    background-color: rgba(199, 217, 137, 0.1);
    border-color: var(--color-accent);
    transform: translateY(-2px);
  }
  @media (min-width: 1024px) {
    footer .brand-section {
      grid-column: span 2;
    }
  }
`;

if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.appendChild(document.createTextNode(hoverStyles));
    document.head.appendChild(style);
}

export default Footer;
