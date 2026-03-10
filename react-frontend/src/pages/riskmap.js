import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

const regions = [
  { id: 1, name: 'Amazon Rainforest', threat: 'Critical', score: 92, status: 'deforestation, temp rise', color: 'var(--color-danger)', icon: <ShieldAlert /> },
  { id: 2, name: 'Western Europe', threat: 'High', score: 78, status: 'pesticide run-off, habitat loss', color: 'var(--color-warning)', icon: <AlertTriangle /> },
  { id: 3, name: 'Sub-Saharan Africa', threat: 'Moderate', score: 55, status: 'drought, expanding agriculture', color: '#ecc94b', icon: <AlertTriangle /> },
  { id: 4, name: 'Nordic Taiga', threat: 'Stable', score: 24, status: 'protected reserves, mild warming', color: 'var(--color-moss)', icon: <CheckCircle2 /> },
];

const RiskMap = () => {
  return (
    <div className="section-padding container" style={styles.pageContainer}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.header}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <MapPin color="var(--color-moss)" size={32} />
          <h1 style={styles.title}>Global Assessment Map</h1>
        </div>
        <p style={styles.subtitle}>AI-generated heat zones indicating biodiversity collapse risk levels</p>
      </motion.div>

      <div style={styles.layout}>
        {/* Mock Map View */}
        <motion.div
          className="glass-panel"
          style={styles.mapContainer}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* A stylized placeholder for an interactive map */}
          <div style={styles.mapGraphic}>
            <div style={styles.mapOverlay}>
              <h3 style={styles.mapPrompt}>Interactive Map View</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Powered by EcoPredict GeoAI</p>

              {/* Fake heat nodes */}
              <motion.div style={{ ...styles.node, top: '40%', left: '30%', backgroundColor: 'rgba(229, 62, 62, 0.6)' }} animate={pulseAnim} />
              <motion.div style={{ ...styles.node, top: '25%', left: '48%', backgroundColor: 'rgba(221, 107, 32, 0.6)' }} animate={{ ...pulseAnim, transition: { delay: 0.5, repeat: Infinity, duration: 2 } }} />
              <motion.div style={{ ...styles.node, top: '15%', left: '55%', backgroundColor: 'rgba(129, 168, 141, 0.6)' }} />
            </div>
          </div>
        </motion.div>

        {/* Region Threat Cards */}
        <div style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>Key Threat Zones</h3>

          <div style={styles.zonesList}>
            {regions.map((region, index) => (
              <motion.div
                key={region.id}
                className="glass-panel"
                style={styles.regionCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (index * 0.1) }}
                whileHover={{ y: -5, borderColor: region.color }}
              >
                <div style={styles.cardHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: region.color }}>{region.icon}</span>
                    <h4 style={styles.regionName}>{region.name}</h4>
                  </div>
                  <span style={{ ...styles.threatBadge, backgroundColor: `${region.color}15`, color: region.color }}>
                    {region.score}/100
                  </span>
                </div>

                <div style={styles.cardBody}>
                  <div style={styles.threatRow}>
                    <span style={styles.label}>Threat Level:</span>
                    <span style={{ color: region.color, fontWeight: '600', fontSize: '0.85rem' }}>{region.threat}</span>
                  </div>
                  <div style={styles.threatRow}>
                    <span style={styles.label}>Primary Drivers:</span>
                    <span style={styles.value}>{region.status}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const pulseAnim = {
  scale: [1, 1.5, 1],
  opacity: [0.6, 0.2, 0.6],
  transition: { repeat: Infinity, duration: 2 }
};

const styles = {
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: 'clamp(2rem, 3vw, 2.5rem)',
    margin: 0
  },
  subtitle: {
    color: 'var(--color-text-muted)',
    fontSize: '1.1rem',
  },
  layout: {
    display: 'grid',
    gridAutoFlow: 'row',
    gridTemplateColumns: 'minmax(0, 100%)',
    gap: '2rem',
  },
  mapContainer: {
    padding: '0.5rem',
    height: '60vh',
    minHeight: '400px',
    maxHeight: '600px',
    width: '100%',
  },
  mapGraphic: {
    width: '100%',
    height: '100%',
    borderRadius: 'calc(var(--radius-md) - 0.5rem)',
    backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1600&auto=format&fit=crop")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  mapOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(15, 32, 29, 0.6)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPrompt: {
    color: 'var(--color-soft-white)',
    fontFamily: 'var(--font-display)',
    fontSize: '1.5rem',
    letterSpacing: '1px',
    marginBottom: '0.5rem',
  },
  node: {
    position: 'absolute',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    boxShadow: '0 0 20px currentColor',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  sidebarTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.25rem',
    marginBottom: '1.5rem',
    color: 'var(--color-forest)'
  },
  zonesList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    width: '100%',
  },
  regionCard: {
    padding: '1.5rem',
    borderTop: '4px solid transparent',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  regionName: {
    fontSize: '1.1rem',
    margin: 0,
    fontWeight: '600',
    color: 'var(--color-text-main)'
  },
  threatBadge: {
    padding: '0.25rem 0.6rem',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: 'auto'
  },
  threatRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    paddingBottom: '0.5rem'
  },
  label: {
    fontSize: '0.85rem',
    color: 'var(--color-text-muted)',
  },
  value: {
    fontSize: '0.85rem',
    fontWeight: '500',
    color: 'var(--color-text-main)',
    textTransform: 'capitalize'
  }
};

export default RiskMap;
