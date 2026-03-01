-- Initialize EcoPredict Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Predictions table
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    year INTEGER NOT NULL,
    species VARCHAR(255) NOT NULL,
    decline_risk INTEGER NOT NULL,
    confidence DECIMAL(5, 4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_latitude CHECK (latitude >= -90 AND latitude <= 90),
    CONSTRAINT valid_longitude CHECK (longitude >= -180 AND longitude <= 180),
    CONSTRAINT valid_risk CHECK (decline_risk IN (0, 1))
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_predictions_species ON predictions(species);
CREATE INDEX IF NOT EXISTS idx_predictions_year ON predictions(year);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at);
CREATE INDEX IF NOT EXISTS idx_predictions_location ON predictions(latitude, longitude);

-- Species table
CREATE TABLE IF NOT EXISTS species (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    common_name VARCHAR(255),
    category VARCHAR(100),
    conservation_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API usage tracking
CREATE TABLE IF NOT EXISTS api_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER,
    response_time_ms INTEGER,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_api_requests_created_at ON api_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_api_requests_endpoint ON api_requests(endpoint);

-- Insert sample species data
INSERT INTO species (name, common_name, category, conservation_status) VALUES
    ('Apis mellifera', 'Western Honey Bee', 'Hymenoptera', 'LC'),
    ('Bombus terrestris', 'Buff-tailed Bumblebee', 'Hymenoptera', 'LC'),
    ('Pieris rapae', 'Small White Butterfly', 'Lepidoptera', 'LC'),
    ('Vanessa atalanta', 'Red Admiral Butterfly', 'Lepidoptera', 'LC'),
    ('Papilio xuthus', 'Asian Swallowtail', 'Lepidoptera', 'LC'),
    ('Danaus plexippus', 'Monarch Butterfly', 'Lepidoptera', 'EN')
ON CONFLICT (name) DO NOTHING;

-- Create view for analytics
CREATE OR REPLACE VIEW prediction_analytics AS
SELECT 
    species,
    COUNT(*) as total_predictions,
    SUM(CASE WHEN decline_risk = 1 THEN 1 ELSE 0 END) as high_risk_count,
    AVG(confidence) as avg_confidence,
    MIN(year) as earliest_year,
    MAX(year) as latest_year
FROM predictions
GROUP BY species;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ecopredict_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ecopredict_user;
