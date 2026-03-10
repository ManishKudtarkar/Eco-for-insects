import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Lightbulb, Fingerprint, ThermometerSun, Droplets, Info } from 'lucide-react';
import { InsightCard } from '../components/Cards';

const correlationData = [
    { year: 2000, tempAnomaly: +0.2, pesticideUse: 100, bugIndex: 100 },
    { year: 2005, tempAnomaly: +0.4, pesticideUse: 120, bugIndex: 85 },
    { year: 2010, tempAnomaly: +0.7, pesticideUse: 145, bugIndex: 72 },
    { year: 2015, tempAnomaly: +0.9, pesticideUse: 160, bugIndex: 60 },
    { year: 2020, tempAnomaly: +1.2, pesticideUse: 175, bugIndex: 51 },
    { year: 2024, tempAnomaly: +1.5, pesticideUse: 180, bugIndex: 44 },
];

const Analytics = () => {
    return (
        <div className="section-padding container" style={styles.pageContainer}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={styles.header}
            >
                <h1 style={styles.title}>Correlation Analytics</h1>
                <p style={styles.subtitle}>Discovering hidden patterns between environmental factors and population declines</p>
            </motion.div>

            <div style={styles.layout}>
                {/* Main Graph */}
                <motion.div
                    className="glass-panel"
                    style={styles.mainGraphContainer}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div style={styles.graphHeader}>
                        <h3 style={styles.graphTitle}>Driver Analysis: Temperature & Pesticides vs Biodiversity</h3>
                        <div style={styles.legendBadges}>
                            <span style={{ ...styles.badge, backgroundColor: 'rgba(221,107,32,0.1)', color: 'var(--color-warning)' }}>
                                <ThermometerSun size={14} /> Temp Anomaly (°C)
                            </span>
                            <span style={{ ...styles.badge, backgroundColor: 'rgba(229,62,62,0.1)', color: 'var(--color-danger)' }}>
                                <Droplets size={14} /> Pesticide Index
                            </span>
                            <span style={{ ...styles.badge, backgroundColor: 'rgba(62,106,83,0.1)', color: 'var(--color-moss)' }}>
                                <Fingerprint size={14} /> Bug Population Index
                            </span>
                        </div>
                    </div>
                    <div style={{ height: '400px', width: '100%', minHeight: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={correlationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="year" stroke="var(--color-text-muted)" tickLine={false} />
                                <YAxis yAxisId="left" stroke="var(--color-text-muted)" tickLine={false} axisLine={false} />
                                <YAxis yAxisId="right" orientation="right" stroke="var(--color-text-muted)" tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--color-soft-white)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid rgba(0,0,0,0.1)',
                                        boxShadow: 'var(--shadow-soft)'
                                    }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Line yAxisId="right" type="monotone" dataKey="tempAnomaly" name="Temp Anomaly (°C)" stroke="var(--color-warning)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                <Line yAxisId="left" type="monotone" dataKey="pesticideUse" name="Pesticides (Index)" stroke="var(--color-danger)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                <Line yAxisId="left" type="monotone" dataKey="bugIndex" name="Insect Index" stroke="var(--color-moss)" strokeWidth={4} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Simulated Heatmap */}
                <motion.div
                    className="glass-panel"
                    style={styles.heatmapContainer}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div style={styles.heatmapHeader}>
                        <h3 style={styles.graphTitle}>Global Variable Correlation Matrix</h3>
                        <span style={styles.dataBadge}><Info size={14} style={{ marginRight: '4px' }} /> Metrics Summary</span>
                    </div>

                    <div style={styles.matrixWrapper}>
                        {['Pesticides', 'Temp Dev.', 'Rainfall', 'Urban Sprawl', 'Deforestation'].map((row, i) => (
                            <div key={i} style={styles.matrixRow}>
                                <div style={styles.matrixLabel}>{row}</div>
                                {[0.9, 0.7, 0.3, 0.8, 0.6].map((val, j) => {
                                    const intensity = Math.abs(Math.cos(i * 1.5 + j * val));
                                    const fixedIntensity = Math.min((intensity + 0.1), 1).toFixed(2);
                                    let color = `rgba(221, 107, 32, ${fixedIntensity})`;
                                    if (i === j) color = 'rgba(62, 106, 83, 0.8)';

                                    return (
                                        <div key={j} style={{ ...styles.matrixCell, backgroundColor: color }} title={`Correlation: ${fixedIntensity}`}>
                                            {fixedIntensity}
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                        <div style={styles.matrixRow}>
                            <div style={styles.matrixLabel}></div>
                            {['Pest.', 'Temp', 'Rain', 'Urban', 'Defor.'].map((col, k) => (
                                <div key={k} style={styles.matrixColLabel}>{col}</div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                <div style={styles.insightsSection}>
                    {/* AI Insights Grid */}
                    <div style={styles.insightsHeader}>
                        <Lightbulb color="var(--color-accent)" size={28} />
                        <h2 style={styles.insightsTitle}>Key Correlation Insights</h2>
                    </div>

                    <div style={styles.insightsGrid}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <InsightCard
                                category="High Correlation"
                                title="Chemical Overlap"
                                description="Models indicate a strong negative correlation between regional insect biomass and the volume of specific agrochemicals within a 50km radius."
                            />
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                            <InsightCard
                                category="Emerging Threat"
                                title="Micro-climate Warming"
                                description="A localized temperature increase of just 1.2°C during spring breeding seasons correlates with a 38% reduction in successful pollinator generations."
                            />
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                            <InsightCard
                                category="Positive Outlier"
                                title="Buffer Zones"
                                description="Regions employing 20%+ forest cover buffers around agricultural land show a 60% slower decline rate compared to monoculture zones."
                            />
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    pageContainer: {
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        marginBottom: '2.5rem',
    },
    title: {
        fontSize: 'clamp(2rem, 3vw, 2.5rem)',
        marginBottom: '0.5rem',
    },
    subtitle: {
        color: 'var(--color-text-muted)',
        fontSize: '1.1rem',
    },
    layout: {
        display: 'grid',
        gridAutoFlow: 'row',
        gridTemplateColumns: '100%',
        gap: '3rem',
    },
    mainGraphContainer: {
        padding: '2rem',
        width: '100%',
    },
    graphHeader: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '2rem',
    },
    graphTitle: {
        fontSize: '1.25rem',
        fontFamily: 'var(--font-display)',
        fontWeight: '600',
        color: 'var(--color-forest)',
        margin: 0
    },
    legendBadges: {
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
    },
    badge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.4rem 0.8rem',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.8rem',
        fontWeight: '600',
    },
    heatmapContainer: {
        padding: '2rem',
        width: '100%',
    },
    heatmapHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    dataBadge: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'rgba(236, 201, 75, 0.15)',
        color: 'var(--color-warning)',
        padding: '0.4rem 0.75rem',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.8rem',
        fontWeight: '600',
    },
    matrixWrapper: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        overflowX: 'auto',
        paddingBottom: '1rem',
        width: '100%',
    },
    matrixRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        minWidth: 'min-content',
    },
    matrixLabel: {
        width: '120px',
        fontSize: '0.85rem',
        fontWeight: '500',
        color: 'var(--color-text-muted)',
        textAlign: 'right',
        paddingRight: '1rem',
        whiteSpace: 'nowrap',
    },
    matrixCell: {
        width: '50px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.75rem',
        color: 'rgba(0,0,0,0.6)',
        fontWeight: '600',
        borderRadius: '2px',
        cursor: 'default',
        transition: 'transform 0.2s',
    },
    matrixColLabel: {
        width: '50px',
        fontSize: '0.75rem',
        color: 'var(--color-text-muted)',
        textAlign: 'center',
        paddingTop: '0.5rem',
    },
    insightsSection: {
        display: 'flex',
        flexDirection: 'column',
    },
    insightsHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        paddingLeft: '0.5rem'
    },
    insightsTitle: {
        fontSize: '1.75rem',
        fontFamily: 'var(--font-display)',
        color: 'var(--color-dark)',
        margin: 0
    },
    insightsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        width: '100%',
    }
};

export default Analytics;
