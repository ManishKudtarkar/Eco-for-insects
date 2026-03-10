import React from 'react';
import { motion } from 'framer-motion';
import { Network, ShieldAlert, Target } from 'lucide-react';

const About = () => {
  return (
    <div className="section-padding container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={styles.header}
      >
        <span style={styles.badge}>Our Mission</span>
        <h1 style={styles.title}>Predicting Tomorrow's Ecology, Today.</h1>
        <p style={styles.subtitle}>
          EcoPredict was founded on a simple principle: we cannot protect what we cannot measure.
          By combining predictive AI, machine learning, and ecological science, we aim to reverse the global decline in insect biodiversity.
        </p>
      </motion.div>

      <div style={styles.grid}>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={styles.imageCard}
        />

        <div style={styles.content}>
          <motion.div
            className="glass-panel"
            style={styles.infoCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div style={styles.iconBox}><Target size={24} /></div>
            <h3 style={styles.cardTitle}>Our Vision</h3>
            <p style={styles.cardText}>
              A world where human progress and ecological stability coexist, powered by proactive conservation strategies.
            </p>
          </motion.div>

          <motion.div
            className="glass-panel"
            style={styles.infoCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div style={styles.iconBox}><Network size={24} /></div>
            <h3 style={styles.cardTitle}>How It Works</h3>
            <p style={styles.cardText}>
              We aggregate data from global sensors, climate models, and citizen science arrays. Our ML models analyze this data to predict population collapses before they happen.
            </p>
          </motion.div>

          <motion.div
            className="glass-panel"
            style={styles.infoCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div style={styles.iconBox}><ShieldAlert size={24} /></div>
            <h3 style={styles.cardTitle}>The Impact</h3>
            <p style={styles.cardText}>
              Providing policymakers with actionable heatmaps and risk assessments to allocate conservation funding where the threat is imminent.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  header: {
    textAlign: 'center',
    maxWidth: '800px',
    margin: '0 auto 5rem auto',
  },
  badge: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    backgroundColor: 'rgba(129, 168, 141, 0.2)',
    color: 'var(--color-moss)',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.85rem',
    fontWeight: '600',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
    marginBottom: '1.5rem',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: 'var(--color-text-muted)',
    lineHeight: '1.8',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(300px, 1fr) 1fr',
    gap: '4rem',
    alignItems: 'center',
  },
  imageCard: {
    height: '600px',
    borderRadius: 'var(--radius-lg)',
    backgroundImage: 'url("https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1500&auto=format&fit=crop")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    boxShadow: 'var(--shadow-soft)',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  infoCard: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  iconBox: {
    width: '48px',
    height: '48px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--color-forest)',
    color: 'var(--color-soft-white)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: '1.25rem',
    margin: 0,
  },
  cardText: {
    color: 'var(--color-text-muted)',
    margin: 0,
    lineHeight: '1.6',
    fontSize: '0.95rem'
  }
};

// Add responsive grid style
const mediaQuery = `
  @media (max-width: 900px) {
    div[style*="grid-template-columns: minmax(300px, 1fr) 1fr"] {
      grid-template-columns: 1fr !important;
    }
    div[style*="height: 600px"] {
      height: 400px !important;
    }
  }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.appendChild(document.createTextNode(mediaQuery));
  document.head.appendChild(style);
}

export default About;
