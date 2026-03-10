import React from 'react';
import { motion } from 'framer-motion';

export const StatCard = ({ title, value, detail, icon, trend, delay = 0 }) => {
    return (
        <motion.div
            className="glass-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -5, boxShadow: 'var(--shadow-hover)' }}
            style={styles.card}
        >
            <div style={styles.header}>
                <span style={styles.title}>{title}</span>
                <div style={styles.iconWrapper}>{icon}</div>
            </div>
            <div>
                <h3 style={styles.value}>{value}</h3>
                <p style={{
                    ...styles.detail,
                    color: trend === 'down' ? 'var(--color-danger)' : trend === 'up' ? 'var(--color-moss)' : 'var(--color-text-muted)'
                }}>
                    {detail}
                </p>
            </div>
        </motion.div>
    );
};

export const InsightCard = ({ title, description, category }) => {
    return (
        <motion.div
            className="glass-panel"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{ ...styles.card, borderLeft: '4px solid var(--color-leaf)' }}
        >
            <div style={styles.categoryTag}>{category}</div>
            <h4 style={styles.insightTitle}>{title}</h4>
            <p style={styles.insightDesc}>{description}</p>
        </motion.div>
    );
}

const styles = {
    card: {
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        cursor: 'default',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: '0.9rem',
        fontWeight: '500',
        color: 'var(--color-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    iconWrapper: {
        padding: '0.5rem',
        backgroundColor: 'rgba(129, 168, 141, 0.15)',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--color-moss)',
        display: 'flex'
    },
    value: {
        fontSize: '2rem',
        fontFamily: 'var(--font-display)',
        fontWeight: '700',
        color: 'var(--color-forest)',
        margin: '0 0 0.25rem 0'
    },
    detail: {
        fontSize: '0.85rem',
        margin: 0,
        fontWeight: '500'
    },
    categoryTag: {
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        color: 'var(--color-leaf)',
        fontWeight: '600',
        marginBottom: '0.5rem'
    },
    insightTitle: {
        fontSize: '1.1rem',
        color: 'var(--color-forest)',
        marginBottom: '0.5rem',
        fontFamily: 'var(--font-display)',
        fontWeight: '600'
    },
    insightDesc: {
        fontSize: '0.9rem',
        color: 'var(--color-text-muted)',
        lineHeight: '1.5',
        margin: 0
    }
};
