import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Calendar, Filter, TrendingDown, TrendingUp,
  Minus, Bug, X, ChevronDown, Globe, Info, RefreshCw
} from 'lucide-react';

const REGION_LABELS = {
  north_america: 'North America',
  south_america: 'South America',
  europe: 'Europe',
  africa: 'Africa',
  asia: 'Asia',
  australia: 'Australia & Oceania',
};

const formatRegion = (key) =>
  REGION_LABELS[key] || (key ? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Unknown');

const InsectSearch = () => {
  const [searchParams, setSearchParams] = useState({
    region: '',
    species: '',
    year_from: '',
    year_to: '',
    status: '',
  });

  const [results, setResults] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedInsect, setSelectedInsect] = useState(null);
  const [decliningAnalysis, setDecliningAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [availableSpecies, setAvailableSpecies] = useState([]);

  const regions = [
    { key: '', name: 'All Regions' },
    { key: 'north_america', name: 'North America' },
    { key: 'south_america', name: 'South America' },
    { key: 'europe', name: 'Europe' },
    { key: 'africa', name: 'Africa' },
    { key: 'asia', name: 'Asia' },
    { key: 'australia', name: 'Australia & Oceania' },
  ];

  const statusOptions = [
    { key: '', name: 'All Status' },
    { key: 'stable', name: 'Stable' },
    { key: 'declining', name: 'Declining' },
    { key: 'increasing', name: 'Increasing' },
  ];

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const response = await fetch('http://localhost:8000/species');
        if (response.ok) {
          const data = await response.json();
          setAvailableSpecies(data.species || []);
        }
      } catch (err) {
        console.error('Failed to fetch species:', err);
      }
    };
    fetchSpecies();
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    const fromYear = searchParams.year_from ? Number(searchParams.year_from) : null;
    const toYear = searchParams.year_to ? Number(searchParams.year_to) : null;

    if (fromYear && toYear && fromYear > toYear) {
      setError('Year From must be less than or equal to Year To.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key]) params.append(key, searchParams[key]);
      });
      const response = await fetch(`http://localhost:8000/search/insects?${params}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Search failed');
      }
      const data = await response.json();
      setResults(data.results || []);
      setStatistics(data.statistics || null);
    } catch (err) {
      setError(err.message || 'Failed to fetch search results. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchParams({ region: '', species: '', year_from: '', year_to: '', status: '' });
    setResults([]);
    setStatistics(null);
    setError(null);
  };

  const fetchDecliningAnalysis = async (speciesName) => {
    setAnalysisLoading(true);
    setDecliningAnalysis(null);
    try {
      const response = await fetch(
        `http://localhost:8000/species/declining-analysis?species=${encodeURIComponent(speciesName)}`
      );
      if (!response.ok) throw new Error('Failed to fetch declining analysis');
      const data = await response.json();
      setDecliningAnalysis(data);
    } catch (err) {
      console.error('Declining analysis error:', err);
      setDecliningAnalysis({ error: true });
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleInsectClick = (insect) => {
    setSelectedInsect(insect);
    fetchDecliningAnalysis(insect.species);
  };

  const closeModal = () => {
    setSelectedInsect(null);
    setDecliningAnalysis(null);
    setAnalysisLoading(false);
  };

  const getTrendIcon = (trend) => {
    switch (trend?.toLowerCase()) {
      case 'declining': return <TrendingDown size={16} style={{ color: 'var(--color-danger)' }} />;
      case 'increasing': return <TrendingUp size={16} style={{ color: 'var(--color-moss)' }} />;
      default: return <Minus size={16} style={{ color: '#2563eb' }} />;
    }
  };

  const getTrendBadgeStyle = (trend) => {
    switch (trend?.toLowerCase()) {
      case 'declining': return { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' };
      case 'increasing': return { background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' };
      default: return { background: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd' };
    }
  };

  const capitalized = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-main)', paddingBottom: '4rem' }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinning { animation: spin 1s linear infinite; }
        .search-result-card { transition: box-shadow 0.25s, transform 0.25s; cursor: pointer; }
        .search-result-card:hover { box-shadow: var(--shadow-hover); transform: translateY(-3px); }
        .search-input { width: 100%; padding: 0.65rem 0.9rem; border: 1px solid #d1d5db; border-radius: var(--radius-sm); font-size: 0.9rem; font-family: var(--font-sans); background: white; color: var(--color-text-main); outline: none; transition: border-color 0.2s; }
        .search-input:focus { border-color: var(--color-moss); box-shadow: 0 0 0 3px rgba(62,106,83,0.1); }
        .trend-badge { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.75rem; border-radius: var(--radius-full); font-size: 0.8rem; font-weight: 600; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; padding: 1rem; z-index: 1000; }
        .modal-box { background: white; border-radius: var(--radius-lg); max-width: 820px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 2rem; }
        .section-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); margin-bottom: 0.3rem; }
        .detail-value { font-weight: 600; color: var(--color-forest); font-size: 0.95rem; }
      `}</style>

      <div className="container" style={{ paddingTop: '3rem' }}>
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '2.5rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <Bug size={36} style={{ color: 'var(--color-moss)' }} />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-forest)', margin: 0 }}>
              Insect Biodiversity Search
            </h1>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', margin: 0 }}>
            Explore insect populations by location, year, and conservation status
          </p>
        </motion.div>

        {/* Filter Panel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel"
          style={{ padding: '1.5rem', marginBottom: '1.75rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showFilters ? '1.25rem' : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={20} style={{ color: 'var(--color-moss)' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-forest)' }}>
                Search Filters
              </span>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', padding: '0.25rem' }}
            >
              <ChevronDown
                size={20}
                style={{ transform: showFilters ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}
              />
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-forest)', marginBottom: '0.4rem', letterSpacing: '0.02em' }}>
                      <Globe size={14} /> Region
                    </label>
                    <select
                      value={searchParams.region}
                      onChange={e => setSearchParams({ ...searchParams, region: e.target.value })}
                      className="search-input"
                    >
                      {regions.map(r => <option key={r.key} value={r.key}>{r.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-forest)', marginBottom: '0.4rem', letterSpacing: '0.02em' }}>
                      <Bug size={14} /> Species Name
                    </label>
                    <select
                      value={searchParams.species}
                      onChange={e => setSearchParams({ ...searchParams, species: e.target.value })}
                      className="search-input"
                    >
                      <option value="">All Species</option>
                      {availableSpecies.map((s, i) => <option key={i} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-forest)', marginBottom: '0.4rem', letterSpacing: '0.02em' }}>
                      <TrendingUp size={14} /> Population Status
                    </label>
                    <select
                      value={searchParams.status}
                      onChange={e => setSearchParams({ ...searchParams, status: e.target.value })}
                      className="search-input"
                    >
                      {statusOptions.map(s => <option key={s.key} value={s.key}>{s.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-forest)', marginBottom: '0.4rem', letterSpacing: '0.02em' }}>
                      <Calendar size={14} /> Year From
                    </label>
                    <input
                      type="number"
                      value={searchParams.year_from}
                      onChange={e => setSearchParams({ ...searchParams, year_from: e.target.value })}
                      placeholder="e.g. 2015"
                      min="1900"
                      max={currentYear}
                      className="search-input"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-forest)', marginBottom: '0.4rem', letterSpacing: '0.02em' }}>
                      <Calendar size={14} /> Year To
                    </label>
                    <input
                      type="number"
                      value={searchParams.year_to}
                      onChange={e => setSearchParams({ ...searchParams, year_to: e.target.value })}
                      placeholder={String(currentYear)}
                      min="1900"
                      max={currentYear}
                      className="search-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.65rem 1.5rem', borderRadius: 'var(--radius-sm)',
                      background: loading ? '#86efac' : 'var(--color-moss)',
                      color: 'white', fontWeight: 600, fontSize: '0.9rem',
                      cursor: loading ? 'not-allowed' : 'pointer', border: 'none',
                      fontFamily: 'var(--font-sans)', transition: 'background 0.2s'
                    }}
                  >
                    {loading
                      ? <><RefreshCw className="spinning" size={16} /> Searching...</>
                      : <><Search size={16} /> Search</>}
                  </button>
                  <button
                    onClick={handleReset}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.65rem 1.25rem', borderRadius: 'var(--radius-sm)',
                      background: '#f3f4f6', color: 'var(--color-text-main)',
                      fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', border: '1px solid #e5e7eb',
                      fontFamily: 'var(--font-sans)'
                    }}
                  >
                    <X size={16} /> Reset
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Statistics */}
        {statistics && statistics.total_records > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="glass-panel"
            style={{ padding: '1.5rem', marginBottom: '1.75rem' }}
          >
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-forest)', marginBottom: '1rem' }}>
              Search Statistics
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
              {[
                { label: 'Total Records', value: statistics.total_records, bg: '#dbeafe', color: '#1d4ed8' },
                { label: 'Species Found', value: statistics.species_count, bg: '#dcfce7', color: 'var(--color-moss)' },
                {
                  label: 'Year Range',
                  value: statistics.year_range?.length === 2
                    ? `${statistics.year_range[0]}-${statistics.year_range[1]}`
                    : 'N/A',
                  bg: '#f3e8ff', color: '#7c3aed'
                },
                { label: 'Regions', value: statistics.regions?.length || 0, bg: '#ffedd5', color: '#c2410c' },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: 'center', padding: '1rem', borderRadius: 'var(--radius-sm)', background: stat.bg }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: stat.color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.35rem', fontWeight: 500 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {statistics.trend_distribution && Object.keys(statistics.trend_distribution).length > 0 && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-forest)' }}>Population Trends:</span>
                {Object.entries(statistics.trend_distribution).map(([trend, count]) => (
                  <span key={trend} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    {getTrendIcon(trend)}
                    <strong style={{ color: 'var(--color-text-main)' }}>{capitalized(trend)}</strong>: {count}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1.5rem' }}
          >
            <p style={{ color: '#b91c1c', margin: 0, fontWeight: 500 }}>{error}</p>
          </motion.div>
        )}

        {/* Results Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {results.map((insect, index) => (
            <motion.div
              key={insect.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              onClick={() => handleInsectClick(insect)}
              className="glass-panel search-result-card"
              style={{ padding: '1.25rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bug size={22} style={{ color: 'var(--color-moss)' }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-forest)', lineHeight: 1.3, wordBreak: 'break-word' }}>
                    {insect.species}
                  </div>
                  {insect.scientific_name && (
                    <div style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                      {insect.scientific_name}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <span className="trend-badge" style={getTrendBadgeStyle(insect.population_trend)}>
                  {getTrendIcon(insect.population_trend)}
                  {capitalized(insect.population_trend)}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  <MapPin size={14} style={{ color: '#2563eb', flexShrink: 0 }} />
                  <span>{formatRegion(insect.region)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  <Calendar size={14} style={{ color: '#7c3aed', flexShrink: 0 }} />
                  <span>{insect.year}</span>
                </div>
                {insect.family && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    <Info size={14} style={{ color: '#c2410c', flexShrink: 0 }} />
                    <span>Family: {insect.family}</span>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: '0.75rem', color: '#9ca3af' }}>
                {insect.latitude?.toFixed(4)}, {insect.longitude?.toFixed(4)}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && results.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '5rem 1rem' }}
          >
            <Bug size={60} style={{ margin: '0 auto 1rem', color: '#d1d5db', display: 'block' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
              No Results Found
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Try adjusting your search filters</p>
          </motion.div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedInsect && (
          <div className="modal-overlay" onClick={closeModal}>
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="modal-box"
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-forest)', marginBottom: '0.3rem' }}>
                    {selectedInsect.species}
                  </h2>
                  {selectedInsect.scientific_name && (
                    <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontStyle: 'italic', margin: 0 }}>
                      {selectedInsect.scientific_name}
                    </p>
                  )}
                </div>
                <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', flexShrink: 0 }}>
                  <X size={22} />
                </button>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <span className="trend-badge" style={{ ...getTrendBadgeStyle(selectedInsect.population_trend), fontSize: '0.9rem', padding: '0.5rem 1.1rem' }}>
                  {getTrendIcon(selectedInsect.population_trend)}
                  Population: {capitalized(selectedInsect.population_trend)}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '1.1rem' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-forest)', marginBottom: '0.9rem', fontSize: '0.95rem', borderBottom: '2px solid var(--color-leaf)', paddingBottom: '0.5rem' }}>
                    Location Details
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                    <div>
                      <div className="section-label">Region</div>
                      <div className="detail-value">{formatRegion(selectedInsect.region)}</div>
                    </div>
                    <div>
                      <div className="section-label">Coordinates</div>
                      <div className="detail-value">{selectedInsect.latitude?.toFixed(4)}, {selectedInsect.longitude?.toFixed(4)}</div>
                    </div>
                    {selectedInsect.description && (
                      <div>
                        <div className="section-label">Description</div>
                        <div style={{ color: 'var(--color-text-main)', fontSize: '0.9rem' }}>{selectedInsect.description}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '1.1rem' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-forest)', marginBottom: '0.9rem', fontSize: '0.95rem', borderBottom: '2px solid var(--color-leaf)', paddingBottom: '0.5rem' }}>
                    Classification
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                    <div>
                      <div className="section-label">Year Observed</div>
                      <div className="detail-value">{selectedInsect.year}</div>
                    </div>
                    {selectedInsect.kingdom && (
                      <div>
                        <div className="section-label">Kingdom</div>
                        <div className="detail-value">{selectedInsect.kingdom}</div>
                      </div>
                    )}
                    {selectedInsect.order && (
                      <div>
                        <div className="section-label">Order</div>
                        <div className="detail-value">{selectedInsect.order}</div>
                      </div>
                    )}
                    {selectedInsect.family && (
                      <div>
                        <div className="section-label">Family</div>
                        <div className="detail-value">{selectedInsect.family}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedInsect.common_names?.length > 0 && (
                <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-forest)', marginBottom: '0.6rem', fontSize: '0.95rem', fontFamily: 'var(--font-display)' }}>
                    Common Names
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {selectedInsect.common_names.map((name, idx) => (
                      <span key={idx} style={{ padding: '0.35rem 0.85rem', background: '#dcfce7', color: '#15803d', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', fontWeight: 500 }}>
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {analysisLoading && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                  <RefreshCw className="spinning" size={28} style={{ color: 'var(--color-moss)', margin: '0 auto 0.75rem', display: 'block' }} />
                  Loading declining analysis...
                </div>
              )}

              {decliningAnalysis && !decliningAnalysis.error && !analysisLoading && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-forest)', marginBottom: '1rem' }}>
                    <TrendingDown size={18} style={{ color: 'var(--color-danger)' }} />
                    Declining Regions Analysis
                  </div>

                  <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.75rem', textAlign: 'center' }}>
                      {[
                        { label: 'Total Records', value: decliningAnalysis.overall_statistics.total_records, color: '#92400e' },
                        { label: 'Declining', value: decliningAnalysis.overall_statistics.declining_count, color: '#dc2626' },
                        { label: 'Decline Rate', value: `${decliningAnalysis.overall_statistics.declining_percentage}%`, color: '#b91c1c' },
                        { label: 'Regions', value: decliningAnalysis.overall_statistics.regions_affected, color: '#92400e' },
                      ].map(s => (
                        <div key={s.label}>
                          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color, fontFamily: 'var(--font-display)' }}>{s.value}</div>
                          <div style={{ fontSize: '0.72rem', color: '#78350f', marginTop: '0.2rem', fontWeight: 500 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {decliningAnalysis.most_declining_region?.declining_percentage > 0 && (
                    <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <MapPin size={16} style={{ color: '#dc2626' }} />
                        <span style={{ fontWeight: 700, color: '#991b1b', fontSize: '0.85rem' }}>Most Affected Region</span>
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#7f1d1d', marginBottom: '0.4rem', fontFamily: 'var(--font-display)' }}>
                        {formatRegion(decliningAnalysis.most_declining_region.region)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.85rem', color: '#991b1b' }}>
                        <span><strong>{decliningAnalysis.most_declining_region.declining_count}</strong> of {decliningAnalysis.most_declining_region.total_records} records declining</span>
                        <span style={{ background: '#dc2626', color: 'white', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.8rem' }}>
                          {decliningAnalysis.most_declining_region.declining_percentage}% decline
                        </span>
                      </div>
                    </div>
                  )}

                  <div style={{ fontWeight: 600, color: 'var(--color-forest)', fontSize: '0.9rem', marginBottom: '0.6rem', fontFamily: 'var(--font-display)' }}>
                    Regional Breakdown
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {decliningAnalysis.regional_analysis.slice(0, 5).map((region, idx) => (
                      <div key={idx} style={{ background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '0.85rem', border: '1px solid rgba(0,0,0,0.06)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Globe size={14} style={{ color: 'var(--color-text-muted)' }} />
                            <span style={{ fontWeight: 600, color: 'var(--color-forest)', fontSize: '0.9rem' }}>
                              {formatRegion(region.region)}
                            </span>
                          </div>
                          <span style={{
                            background: region.declining_percentage > 50 ? '#dc2626' : region.declining_percentage > 30 ? '#ea580c' : '#16a34a',
                            color: 'white', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.72rem', fontWeight: 700
                          }}>
                            {region.declining_percentage}%
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            <TrendingDown size={12} style={{ color: '#dc2626' }} />{region.declining_count} declining
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            <Minus size={12} style={{ color: '#2563eb' }} />{region.stable_count} stable
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            <TrendingUp size={12} style={{ color: '#16a34a' }} />{region.increasing_count} increasing
                          </span>
                        </div>
                        <div style={{ marginTop: '0.5rem', height: '5px', background: '#e5e7eb', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            background: region.declining_percentage > 50 ? '#dc2626' : region.declining_percentage > 30 ? '#ea580c' : '#16a34a',
                            width: `${region.declining_percentage}%`, transition: 'width 0.4s'
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {decliningAnalysis?.error && !analysisLoading && (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#9ca3af' }}>
                  <Info size={28} style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>Declining analysis not available for this species</p>
                </div>
              )}

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb', fontSize: '0.78rem', color: '#9ca3af' }}>
                Data Source: {selectedInsect.source?.replace(/_/g, ' ').toUpperCase() || 'Database'}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InsectSearch;
