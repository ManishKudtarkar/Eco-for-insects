import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Globe, ShieldAlert } from 'lucide-react';

const Home = () => {
  return (
    <div style={styles.page}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay}></div>
        <div className="container" style={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span style={styles.badge}>Next-Gen Environmental Analytics</span>
            <h1 style={styles.headline}>
              <span style={{ color: 'var(--color-accent)' }}>EcoPredict</span><br />
              AI-Driven Biodiversity Forecasting
            </h1>
            <p style={styles.subHeadline}>
              Empowering conservationists and policymakers with predictive AI to track insect populations, forecast ecological risks, and prevent biodiversity loss before it happens.
            </p>
            <div style={styles.ctaGroup}>
              <Link to="/dashboard" style={styles.primaryBtn}>
                Explore Dashboard <ArrowRight size={18} />
              </Link>
              <Link to="/analytics" style={styles.secondaryBtn}>
                View Insights
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="section-padding container" style={styles.highlightsSection}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={styles.sectionHeader}
        >
          <h2 style={styles.sectionTitle}>Why EcoPredict?</h2>
          <p style={styles.sectionDesc}>Addressing the global crisis of insect population decline with state-of-the-art predictive technologies.</p>
        </motion.div>

        <div style={styles.featuresGrid}>
          <FeatureCard
            icon={<ShieldAlert size={32} />}
            title="Biodiversity Loss Tracking"
            desc="Monitor real-time decline rates across thousands of insect species globally."
            delay={0.1}
          />
          <FeatureCard
            icon={<BarChart3 size={32} />}
            title="AI Predictions"
            desc="Forecast population trends 5, 10, and 50 years into the future using machine learning models."
            delay={0.3}
          />
          <FeatureCard
            icon={<Globe size={32} />}
            title="Conservation Impact"
            desc="Identify high-risk regions using advanced algorithms and target conservation efforts where they matter most."
            delay={0.5}
          />
        </div>
      </section>

      {/* Action Banner */}
      <section style={styles.actionBanner}>
        <div className="container" style={styles.actionBannerContent}>
          <motion.div
            className="glass-panel-dark"
            style={styles.actionCard}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 style={{ ...styles.sectionTitle, color: 'var(--color-soft-white)', marginBottom: '1rem' }}>Ready to make an impact?</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
              Join researchers, policymakers, and environmentalists using our AI tools to safeguard the future of our planet.
            </p>
            <Link to="/signup" style={styles.primaryBtn}>
              Create Free Account
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, delay }) => (
  <motion.div
    className="glass-panel"
    style={styles.featureCard}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ y: -10 }}
  >
    <div style={styles.iconBox}>{icon}</div>
    <h3 style={styles.featureTitle}>{title}</h3>
    <p style={styles.featureDesc}>{desc}</p>
  </motion.div>
);

const styles = {
  page: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },
  hero: {
    position: 'relative',
    height: '70vh',
    minHeight: '500px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    backgroundImage: 'url("https://images.unsplash.com/photo-1542385262-cdf06b2bf4ce?q=80&w=2500&auto=format&fit=crop")',
   backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 32, 29, 0.75)',
    zIndex: 1,
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '900px',
    textAlign: 'center',
    padding: '4rem 1rem',
    margin: '0 auto',
  },
  badge: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    backgroundColor: 'rgba(199, 217, 137, 0.2)',
    color: 'var(--color-accent)',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.85rem',
    fontWeight: '600',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '1.5rem',
    border: '1px solid rgba(199, 217, 137, 0.3)',
  },
  headline: {
    fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
    color: 'var(--color-soft-white)',
    marginBottom: '1.5rem',
    fontWeight: '800',
    lineHeight: '1.1',
    textShadow: '0 4px 20px rgba(0,0,0,0.3)',
  },
  subHeadline: {
    fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: '3rem',
    maxWidth: '700px',
    margin: '0 auto 3rem auto',
    lineHeight: '1.8',
  },
  ctaGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-dark)',
    padding: '1rem 2rem',
    borderRadius: 'var(--radius-full)',
    fontWeight: '600',
    fontSize: '1.1rem',
    textDecoration: 'none',
    transition: 'transform 0.2s, boxShadow 0.2s',
    boxShadow: '0 4px 20px rgba(199, 217, 137, 0.4)',
  },
  secondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    color: 'var(--color-soft-white)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    padding: '1rem 2rem',
    borderRadius: 'var(--radius-full)',
    fontWeight: '600',
    fontSize: '1.1rem',
    textDecoration: 'none',
    transition: 'background 0.2s',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '4rem',
    maxWidth: '700px',
    margin: '0 auto 4rem',
  },
  sectionTitle: {
    fontSize: 'clamp(2rem, 3vw, 2.5rem)',
    marginBottom: '1rem',
  },
  sectionDesc: {
    fontSize: '1.1rem',
    color: 'var(--color-text-muted)',
  },
  highlightsSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    width: '100%'
  },
  featureCard: {
    padding: '2.5rem 2rem',
    textAlign: 'center',
    cursor: 'default',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconBox: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: 'rgba(62, 106, 83, 0.1)',
    color: 'var(--color-moss)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.5rem',
  },
  featureTitle: {
    fontSize: '1.25rem',
    marginBottom: '1rem',
  },
  featureDesc: {
    color: 'var(--color-text-muted)',
    lineHeight: '1.6',
    fontSize: '0.95rem'
  },
  actionBanner: {
    padding: '6rem 0',
    backgroundColor: 'var(--color-bg-secondary)',
    display: 'flex',
    justifyContent: 'center'
  },
  actionBannerContent: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center'
  },
  actionCard: {
    padding: '4rem 2rem',
    textAlign: 'center',
    borderRadius: 'var(--radius-lg)',
    width: '100%',
    maxWidth: '900px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }
};

const hoverStyles = `
  a[style*="background-color: var(--color-accent)"]:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(199, 217, 137, 0.6) !important;
  }
  a[style*="backdrop-filter: blur"]:hover {
    background: rgba(255, 255, 255, 0.2) !important;
  }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.appendChild(document.createTextNode(hoverStyles));
  document.head.appendChild(style);
}

export default Home;
