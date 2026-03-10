import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingDown, AlertTriangle, Bug, MapPin, Database, Activity, CheckCircle, Cpu } from 'lucide-react';
import { StatCard } from '../components/Cards';

const mockTrendData = [
  { year: '2015', population: 100, projection: 100 },
  { year: '2018', population: 85, projection: 88 },
  { year: '2021', population: 76, projection: 78 },
  { year: '2024', population: 68, projection: 70 },
  { year: '2027', population: null, projection: 62 },
  { year: '2030', population: null, projection: 55 },
];

const mockRegionData = [
  { region: 'Amazon Basin', decline: 42 },
  { region: 'European Plains', decline: 38 },
  { region: 'North Am. Midwest', decline: 35 },
  { region: 'SE Asia Tropics', decline: 48 },
];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        >
          <Bug size={48} color="var(--color-moss)" />
        </motion.div>
        <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)', fontWeight: '500' }}>
          Initializing Distributed Data Processing...
        </p>
      </div>
    );
  }

  return (
    <div className="section-padding container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.header}
      >
        <h1 style={styles.title}>Global Analytics Dashboard</h1>
        <p style={styles.subtitle}>Real-time monitoring of insect biodiversity and AI-driven forecasts</p>
      </motion.div>

      {/* AI Processing Metrics */}
      <h3 style={styles.sectionHeading}>Data Engine Metrics</h3>
      <div style={styles.statsGrid}>
        <StatCard
          title="Total Records Processed"
          value="1.2B+"
          detail="Historical & Live Data"
          icon={<Database />}
          trend="up"
          delay={0.1}
        />
        <StatCard
          title="Data Ingestion Rate"
          value="~50K/s"
          detail="Real-time IoT Streams"
          icon={<Activity />}
          trend="up"
          delay={0.2}
        />
        <StatCard
          title="Prediction Confidence"
          value="94.2%"
          detail="Validated Precision"
          icon={<CheckCircle />}
          trend="up"
          delay={0.3}
        />
        <StatCard
          title="Active Algorithms"
          value="128"
          detail="Live Forecast Engine"
          icon={<Cpu />}
          delay={0.4}
        />
      </div>

      <h3 style={styles.sectionHeading}>Global Biodiversity Metrics</h3>
      {/* Summary Stats */}
      <div style={styles.statsGrid}>
        <StatCard
          title="Global Decline Rate"
          value="2.5%"
          detail="Annually since 1990"
          icon={<TrendingDown />}
          trend="down"
          delay={0.1}
        />
        <StatCard
          title="Critical Risk Species"
          value="41%"
          detail="Of global insect species"
          icon={<AlertTriangle />}
          trend="down"
          delay={0.2}
        />
        <StatCard
          title="Affected Biomass"
          value="2.5M"
          detail="Tons estimated loss"
          icon={<Bug />}
          trend="down"
          delay={0.3}
        />
        <StatCard
          title="Monitored Regions"
          value="142"
          detail="Active biosensor arrays"
          icon={<MapPin />}
          delay={0.4}
        />
      </div>

      <div style={styles.chartsGrid}>
        {/* Main Trend Chart */}
        <motion.div
          className="glass-panel"
          style={styles.chartCard}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 style={styles.chartTitle}>Population Trend & 2030 AI Forecast</h3>
          <div style={{ height: '350px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTrendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPop" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-moss)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-moss)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="year" stroke="var(--color-text-muted)" tickLine={false} />
                <YAxis stroke="var(--color-text-muted)" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-soft-white)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    boxShadow: 'var(--shadow-soft)'
                  }}
                />
                <Area type="monotone" dataKey="population" stroke="var(--color-forest)" strokeWidth={3} fillOpacity={1} fill="url(#colorPop)" name="Actual Index" />
                <Area type="monotone" dataKey="projection" stroke="var(--color-danger)" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorProj)" name="AI Projection" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Regional Bar Chart */}
        <motion.div
          className="glass-panel"
          style={styles.chartCard}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 style={styles.chartTitle}>Highest Decline by Region (%)</h3>
          <div style={{ height: '350px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockRegionData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis type="number" stroke="var(--color-text-muted)" />
                <YAxis dataKey="region" type="category" stroke="var(--color-text-main)" width={120} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{
                    backgroundColor: 'var(--color-soft-white)',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    boxShadow: 'var(--shadow-soft)'
                  }}
                />
                <Bar dataKey="decline" fill="var(--color-danger)" radius={[0, 4, 4, 0]} barSize={24} name="Decline Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const styles = {
  loaderContainer: {
    height: '80vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginBottom: '3rem',
  },
  title: {
    fontSize: 'clamp(2rem, 3vw, 2.5rem)',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: 'var(--color-text-muted)',
    fontSize: '1.1rem',
  },
  sectionHeading: {
    fontSize: '1.35rem',
    fontFamily: 'var(--font-display)',
    fontWeight: '600',
    color: 'var(--color-dark)',
    marginBottom: '1rem',
    borderBottom: '2px solid rgba(129, 168, 141, 0.2)',
    paddingBottom: '0.5rem',
    display: 'inline-block'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '2rem',
  },
  chartCard: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  chartTitle: {
    fontSize: '1.1rem',
    fontFamily: 'var(--font-display)',
    fontWeight: '600',
    color: 'var(--color-forest)',
    marginBottom: '1.5rem',
  }
};

// Quick media query for charts grid
const dashboardMediaQuery = `
  @media (max-width: 768px) {
    div[style*="grid-template-columns: repeat(auto-fit, minmax(400px, 1fr))"] {
      grid-template-columns: 1fr !important;
    }
  }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.appendChild(document.createTextNode(dashboardMediaQuery));
  document.head.appendChild(style);
}

export default Dashboard;
