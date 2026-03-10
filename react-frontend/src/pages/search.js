import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MapPin, Calendar, Filter, TrendingDown, TrendingUp, 
  Minus, Bug, X, ChevronDown, Globe, Info, RefreshCw 
} from 'lucide-react';

const InsectSearch = () => {
  const [searchParams, setSearchParams] = useState({
    region: '',
    species: '',
    year_from: '',
    year_to: '',
    status: ''
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
    { key: 'australia', name: 'Australia & Oceania' }
  ];

  const statusOptions = [
    { key: '', name: 'All Status' },
    { key: 'stable', name: 'Stable' },
    { key: 'declining', name: 'Declining' },
    { key: 'increasing', name: 'Increasing' }
  ];

  const currentYear = new Date().getFullYear();

  // Fetch available species on mount
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
    handleSearch(); // Load initial results
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key]) {
          params.append(key, searchParams[key]);
        }
      });
      
      const response = await fetch(`http://localhost:8000/search/insects?${params}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setResults(data.results || []);
      setStatistics(data.statistics || null);
    } catch (err) {
      setError('Failed to fetch search results. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchParams({
      region: '',
      species: '',
      year_from: '',
      year_to: '',
      status: ''
    });
    setResults([]);
    setStatistics(null);
    setError(null);
  };

  const fetchDecliningAnalysis = async (speciesName) => {
    setAnalysisLoading(true);
    setDecliningAnalysis(null);
    
    try {
      const response = await fetch(`http://localhost:8000/species/declining-analysis?species=${encodeURIComponent(speciesName)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch declining analysis');
      }
      
      const data = await response.json();
      setDecliningAnalysis(data);
    } catch (err) {
      console.error('Declining analysis error:', err);
      setDecliningAnalysis({ error: 'Failed to load declining analysis' });
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
    switch(trend?.toLowerCase()) {
      case 'declining':
        return <TrendingDown style={{color: '#dc2626'}} size={20} />;
      case 'increasing':
        return <TrendingUp style={{color: '#16a34a'}} size={20} />;
      case 'stable':
        return <Minus style={{color: '#2563eb'}} size={20} />;
      default:
        return <Minus style={{color: '#6b7280'}} size={20} />;
    }
  };

  const getTrendColor = (trend) => {
    switch(trend?.toLowerCase()) {
      case 'declining':
        return { background: '#fee2e2', borderColor: '#fca5a5', color: '#b91c1c' };
      case 'increasing':
        return { background: '#dcfce7', borderColor: '#86efac', color: '#15803d' };
      case 'stable':
        return { background: '#dbeafe', borderColor: '#93c5fd', color: '#1e40af' };
      default:
        return { background: '#f3f4f6', borderColor: '#d1d5db', color: '#374151' };
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #eff6ff 100%)',
      padding: '2rem 1rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    maxWidth: {
      maxWidth: '1400px',
      margin: '0 auto'
    },
    card: {
      background: 'white',
      borderRadius: '1rem',
      boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
      padding: '1.5rem',
      marginBottom: '1.5rem'
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '0.95rem',
      outline: 'none',
      transition: 'all 0.2s',
      fontFamily: 'inherit'
    },
    button: {
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      border: 'none',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s',
      fontSize: '0.95rem'
    },
    primaryButton: {
      background: '#16a34a',
      color: 'white'
    },
    secondaryButton: {
      background: '#e5e7eb',
      color: '#374151'
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: '500',
      border: '1px solid'
    },
    resultCard: {
      background: 'white',
      borderRadius: '0.75rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
      padding: '1.5rem',
      cursor: 'pointer',
      transition: 'all 0.3s',
      border: '1px solid #f3f4f6'
    },
    modal: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      zIndex: 1000
    },
    modalContent: {
      background: 'white',
      borderRadius: '1rem',
      maxWidth: '800px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto',
      padding: '2rem'
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinning { animation: spin 1s linear infinite; }
        .result-card:hover { box-shadow: 0 8px 16px rgba(0,0,0,0.12); transform: translateY(-2px); }
      `}</style>
      
      <div style={styles.maxWidth}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '2rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Bug style={{ color: '#16a34a' }} size={40} />
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
              Insect Biodiversity Search
            </h1>
          </div>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
            Explore insect populations by location, year, and conservation status
          </p>
        </motion.div>

        {/* Search Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={styles.card}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter style={{ color: '#16a34a' }} size={24} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>Search Filters</h2>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', padding: '0.5rem' }}
            >
              <ChevronDown
                style={{ transform: showFilters ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}
                size={20}
              />
            </button>
          </div>

          {showFilters && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                {/* Region Filter */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    <Globe size={16} />
                    Region
                  </label>
                  <select
                    value={searchParams.region}
                    onChange={(e) => setSearchParams({ ...searchParams, region: e.target.value })}
                    style={styles.input}
                  >
                    {regions.map(r => (
                      <option key={r.key} value={r.key}>{r.name}</option>
                    ))}
                  </select>
                </div>

                {/* Species Dropdown */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    <Bug size={16} />
                    Species Name
                  </label>
                  <select
                    value={searchParams.species}
                    onChange={(e) => setSearchParams({ ...searchParams, species: e.target.value })}
                    style={styles.input}
                  >
                    <option value="">All Species</option>
                    {availableSpecies.map((species, idx) => (
                      <option key={idx} value={species}>{species}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    <TrendingUp size={16} />
                    Population Status
                  </label>
                  <select
                    value={searchParams.status}
                    onChange={(e) => setSearchParams({ ...searchParams, status: e.target.value })}
                    style={styles.input}
                  >
                    {statusOptions.map(s => (
                      <option key={s.key} value={s.key}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Year From */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    <Calendar size={16} />
                    Year From
                  </label>
                  <input
                    type="number"
                    value={searchParams.year_from}
                    onChange={(e) => setSearchParams({ ...searchParams, year_from: e.target.value })}
                    placeholder="2015"
                    min="1900"
                    max={currentYear}
                    style={styles.input}
                  />
                </div>

                {/* Year To */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    <Calendar size={16} />
                    Year To
                  </label>
                  <input
                    type="number"
                    value={searchParams.year_to}
                    onChange={(e) => setSearchParams({ ...searchParams, year_to: e.target.value })}
                    placeholder={currentYear.toString()}
                    min="1900"
                    max={currentYear}
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', paddingTop: '0.5rem' }}>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  style={{ ...styles.button, ...styles.primaryButton, opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="spinning" size={20} />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search size={20} />
                      Search
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  style={{ ...styles.button, ...styles.secondaryButton }}
                >
                  <X size={20} />
                  Reset
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Statistics */}
        {statistics && statistics.total_records > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            style={styles.card}
          >
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>Search Statistics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              <div style={{ textAlign: 'center', padding: '1rem', background: '#dbeafe', borderRadius: '0.5rem' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>{statistics.total_records}</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>Total Records</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: '#dcfce7', borderRadius: '0.5rem' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a' }}>{statistics.species_count}</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>Species Found</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: '#f3e8ff', borderRadius: '0.5rem' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#9333ea' }}>
                  {statistics.year_range?.length === 2 ? 
                    `${statistics.year_range[0]}-${statistics.year_range[1]}` : 'N/A'}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>Year Range</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: '#fed7aa', borderRadius: '0.5rem' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ea580c' }}>{statistics.regions?.length || 0}</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>Regions</div>
              </div>
            </div>

            {/* Trend Distribution */}
            {statistics.trend_distribution && Object.keys(statistics.trend_distribution).length > 0 && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Population Trends:</span>
                  {Object.entries(statistics.trend_distribution).map(([trend, count]) => (
                    <div key={trend} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {getTrendIcon(trend)}
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {trend.charAt(0).toUpperCase() + trend.slice(1)}: <strong>{count}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1.5rem' }}
          >
            <p style={{ color: '#b91c1c', margin: 0 }}>{error}</p>
          </motion.div>
        )}

        {/* Results Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}
        >
          {results.map((insect, index) => (
            <motion.div
              key={insect.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleInsectClick(insect)}
              className="result-card"
              style={styles.resultCard}
            >
              <div>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Bug style={{ color: '#16a34a', flexShrink: 0 }} size={24} />
                    <div>
                      <h3 style={{ fontWeight: '600', color: '#1f2937', fontSize: '1.125rem', margin: 0, lineHeight: '1.4' }}>
                        {insect.species}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic', margin: '0.25rem 0 0 0' }}>
                        {insect.scientific_name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ ...styles.badge, ...getTrendColor(insect.population_trend) }}>
                    {getTrendIcon(insect.population_trend)}
                    {insect.population_trend.charAt(0).toUpperCase() + insect.population_trend.slice(1)}
                  </span>
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                    <MapPin size={16} style={{ color: '#2563eb' }} />
                    <span>{insect.region}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                    <Calendar size={16} style={{ color: '#9333ea' }} />
                    <span>{insect.year}</span>
                  </div>
                  {insect.family && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                      <Info size={16} style={{ color: '#ea580c' }} />
                      <span>Family: {insect.family}</span>
                    </div>
                  )}
                </div>

                {/* Location Coordinates */}
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    📍 {insect.latitude.toFixed(4)}°, {insect.longitude.toFixed(4)}°
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {!loading && results.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '4rem 1rem' }}
          >
            <Bug style={{ margin: '0 auto 1rem auto', color: '#d1d5db' }} size={64} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>No Results Found</h3>
            <p style={{ color: '#9ca3af' }}>Try adjusting your search filters</p>
          </motion.div>
        )}

        {/* Detail Modal */}
        {selectedInsect && (
          <div style={styles.modal} onClick={closeModal}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={styles.modalContent}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                    {selectedInsect.species}
                  </h2>
                  <p style={{ fontSize: '1.125rem', color: '#6b7280', fontStyle: 'italic' }}>
                    {selectedInsect.scientific_name}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0.5rem' }}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Status */}
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ ...styles.badge, ...getTrendColor(selectedInsect.population_trend), fontSize: '1rem', padding: '0.75rem 1.25rem' }}>
                  {getTrendIcon(selectedInsect.population_trend)}
                  Population: {selectedInsect.population_trend.charAt(0).toUpperCase() + selectedInsect.population_trend.slice(1)}
                </span>
              </div>

              {/* Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ fontWeight: '600', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', margin: 0 }}>Location Details</h3>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Region</div>
                    <div style={{ fontWeight: '500', color: '#1f2937' }}>{selectedInsect.region}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Coordinates</div>
                    <div style={{ fontWeight: '500', color: '#1f2937' }}>
                      {selectedInsect.latitude.toFixed(4)}°, {selectedInsect.longitude.toFixed(4)}°
                    </div>
                  </div>
                  {selectedInsect.description && (
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Description</div>
                      <div style={{ fontWeight: '500', color: '#1f2937' }}>{selectedInsect.description}</div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ fontWeight: '600', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', margin: 0 }}>Classification</h3>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Year Observed</div>
                    <div style={{ fontWeight: '500', color: '#1f2937' }}>{selectedInsect.year}</div>
                  </div>
                  {selectedInsect.kingdom && (
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Kingdom</div>
                      <div style={{ fontWeight: '500', color: '#1f2937' }}>{selectedInsect.kingdom}</div>
                    </div>
                  )}
                  {selectedInsect.order && (
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Order</div>
                      <div style={{ fontWeight: '500', color: '#1f2937' }}>{selectedInsect.order}</div>
                    </div>
                  )}
                  {selectedInsect.family && (
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Family</div>
                      <div style={{ fontWeight: '500', color: '#1f2937' }}>{selectedInsect.family}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Common Names */}
              {selectedInsect.common_names && selectedInsect.common_names.length > 0  && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                  <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.75rem' }}>Common Names</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {selectedInsect.common_names.map((name, idx) => (
                      <span key={idx} style={{ padding: '0.5rem 1rem', background: '#dcfce7', color: '#15803d', borderRadius: '9999px', fontSize: '0.875rem' }}>
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Declining Analysis */}
              {analysisLoading && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb', textAlign: 'center', padding: '2rem' }}>
                  <RefreshCw className="spinning" size={32} style={{ color: '#16a34a', margin: '0 auto' }} />
                  <p style={{ color: '#6b7280', marginTop: '1rem' }}>Loading declining analysis...</p>
                </div>
              )}

              {decliningAnalysis && !decliningAnalysis.error && !analysisLoading && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                  <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingDown size={20} style={{ color: '#dc2626' }} />
                    Declining Regions Analysis
                  </h3>
                  
                  {/* Overall Statistics */}
                  <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', textAlign: 'center' }}>
                      <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#92400e' }}>
                          {decliningAnalysis.overall_statistics.total_records}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#78350f', marginTop: '0.25rem' }}>Total Records</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>
                          {decliningAnalysis.overall_statistics.declining_count}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#78350f', marginTop: '0.25rem' }}>Declining</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#b91c1c' }}>
                          {decliningAnalysis.overall_statistics.declining_percentage}%
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#78350f', marginTop: '0.25rem' }}>Decline Rate</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#92400e' }}>
                          {decliningAnalysis.overall_statistics.regions_affected}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#78350f', marginTop: '0.25rem' }}>Regions</div>
                      </div>
                    </div>
                  </div>

                  {/* Most Declining Region Highlight */}
                  {decliningAnalysis.most_declining_region && decliningAnalysis.most_declining_region.declining_percentage > 0 && (
                    <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <MapPin size={18} style={{ color: '#dc2626' }} />
                        <span style={{ fontWeight: '600', color: '#991b1b' }}>Most Affected Region</span>
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#7f1d1d', marginBottom: '0.5rem' }}>
                        {decliningAnalysis.most_declining_region.region}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <span style={{ color: '#991b1b', fontSize: '0.875rem' }}>
                          <strong>{decliningAnalysis.most_declining_region.declining_count}</strong> of {decliningAnalysis.most_declining_region.total_records} records declining
                        </span>
                        <span style={{ background: '#dc2626', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '600' }}>
                          {decliningAnalysis.most_declining_region.declining_percentage}% decline
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Regional Breakdown */}
                  <div>
                    <h4 style={{ fontWeight: '600', color: '#374151', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                      Regional Breakdown
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {decliningAnalysis.regional_analysis.slice(0, 5).map((region, idx) => (
                        <div key={idx} style={{ background: '#f9fafb', borderRadius: '0.5rem', padding: '0.75rem', border: '1px solid #e5e7eb' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Globe size={16} style={{ color: '#4b5563' }} />
                              <span style={{ fontWeight: '600', color: '#1f2937' }}>{region.region}</span>
                            </div>
                            <span style={{ 
                              background: region.declining_percentage > 50 ? '#dc2626' : region.declining_percentage > 30 ? '#ea580c' : '#16a34a',
                              color: 'white', 
                              padding: '0.25rem 0.5rem', 
                              borderRadius: '0.25rem', 
                              fontSize: '0.75rem', 
                              fontWeight: '600' 
                            }}>
                              {region.declining_percentage}%
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: '#6b7280' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <TrendingDown size={14} style={{ color: '#dc2626' }} />
                              {region.declining_count} declining
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Minus size={14} style={{ color: '#2563eb' }} />
                              {region.stable_count} stable
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <TrendingUp size={14} style={{ color: '#16a34a' }} />
                              {region.increasing_count} increasing
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div style={{ marginTop: '0.5rem', height: '6px', background: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
                            <div style={{ 
                              height: '100%', 
                              background: region.declining_percentage > 50 ? '#dc2626' : region.declining_percentage > 30 ? '#ea580c' : '#16a34a',
                              width: `${region.declining_percentage}%`,
                              transition: 'width 0.3s'
                            }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {decliningAnalysis && decliningAnalysis.error && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb', textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                  <Info size={32} style={{ margin: '0 auto', marginBottom: '0.5rem' }} />
                  <p>Declining analysis not available for this species</p>
                </div>
              )}

              {/* Data Source */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                  Data Source: {selectedInsect.source?.replace('_', ' ').toUpperCase() || 'Database'}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsectSearch;
