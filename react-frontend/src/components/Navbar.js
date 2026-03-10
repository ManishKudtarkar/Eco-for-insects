import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Search', path: '/search' },
    { name: 'Risk Map', path: '/risk-map' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'About', path: '/about' },
  ];

  return (
    <header style={styles.header} className="glass-panel">
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          <Leaf style={{ color: 'var(--color-leaf)' }} size={28} />
          <span style={styles.logoText}>EcoPredict</span>
        </Link>

        {/* Desktop Nav */}
        <nav style={styles.desktopNav}>
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                ...styles.navLink,
                fontWeight: location.pathname === link.path ? '600' : '400',
                color: location.pathname === link.path ? 'var(--color-forest)' : 'var(--color-text-muted)'
              }}
            >
              {link.name}
            </Link>
          ))}
          <Link to="/login" style={styles.loginBtn}>
            Sign In
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button style={styles.mobileBtn} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <nav style={styles.mobileMenu}>
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={styles.mobileLink}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <Link to="/login" style={{...styles.mobileLink, color: 'var(--color-moss)', fontWeight: '600'}} onClick={() => setIsOpen(false)}>
            Sign In
          </Link>
        </nav>
      )}
    </header>
  );
};

const styles = {
  header: {
    position: 'sticky',
    top: '0',
    zIndex: 100,
    borderBottom: '1px solid rgba(255,255,255,0.4)',
    borderRadius: '0',
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
  },
  logoText: {
    fontSize: '1.5rem',
    fontFamily: 'var(--font-display)',
    fontWeight: '700',
    color: 'var(--color-forest)',
    letterSpacing: '-0.5px'
  },
  desktopNav: {
    display: 'none',
  },
  navLink: {
    textDecoration: 'none',
    fontSize: '0.95rem',
    transition: 'color 0.2s',
  },
  loginBtn: {
    backgroundColor: 'var(--color-forest)',
    color: 'var(--color-soft-white)',
    padding: '0.5rem 1.25rem',
    borderRadius: 'var(--radius-full)',
    fontWeight: '500',
    transition: 'background-color 0.2s',
    textDecoration: 'none',
    fontSize: '0.95rem'
  },
  mobileBtn: {
    display: 'block',
    color: 'var(--color-forest)',
  },
  mobileMenu: {
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem 2rem',
    backgroundColor: 'var(--color-soft-white)',
    borderTop: '1px solid rgba(0,0,0,0.05)',
  },
  mobileLink: {
    padding: '0.75rem 0',
    color: 'var(--color-text-main)',
    textDecoration: 'none',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
  }
};

// Quick media query for desktop nav
const mediaQuery = `
  @media (min-width: 768px) {
    header nav[style*="display: none"] {
      display: flex !important;
      align-items: center;
      gap: 2rem;
    }
    header button[style*="display: block"] {
      display: none !important;
    }
  }
`;

// Inject styles for media queries
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.appendChild(document.createTextNode(mediaQuery));
  document.head.appendChild(style);
}

export default Navbar;
