// EcoPredict Frontend - JavaScript
// Connects to FastAPI backend for predictions

// Configuration
const config = {
    apiUrl: '/api',  // Use nginx proxy instead of direct connection
    updateInterval: 5000
};

// State
const state = {
    predictionsHistory: [],
    apiHealthy: false
};

// Region Coordinates (Center points for countries)
const REGIONS = {
    "Afghanistan": { lat: 33.9391, lon: 67.7100 },
    "Albania": { lat: 41.1533, lon: 20.1683 },
    "Algeria": { lat: 28.0339, lon: 1.6596 },
    "Andorra": { lat: 42.5063, lon: 1.5218 },
    "Angola": { lat: -11.2027, lon: 17.8739 },
    "Antigua and Barbuda": { lat: 17.0608, lon: -61.7964 },
    "Argentina": { lat: -38.4161, lon: -63.6167 },
    "Armenia": { lat: 40.0691, lon: 45.0382 },
    "Australia": { lat: -25.2744, lon: 133.7751 },
    "Austria": { lat: 47.5162, lon: 14.5501 },
    "Azerbaijan": { lat: 40.1431, lon: 47.5769 },
    "Bahamas": { lat: 25.0343, lon: -77.3963 },
    "Bahrain": { lat: 26.0667, lon: 50.5577 },
    "Bangladesh": { lat: 23.6850, lon: 90.3563 },
    "Barbados": { lat: 13.1939, lon: -59.5432 },
    "Belarus": { lat: 53.7098, lon: 27.9534 },
    "Belgium": { lat: 50.5039, lon: 4.4699 },
    "Belize": { lat: 17.1899, lon: -88.4976 },
    "Benin": { lat: 9.3077, lon: 2.3158 },
    "Bhutan": { lat: 27.5142, lon: 90.4336 },
    "Bolivia": { lat: -16.2902, lon: -63.5887 },
    "Bosnia and Herzegovina": { lat: 43.9159, lon: 17.6791 },
    "Botswana": { lat: -22.3285, lon: 24.6849 },
    "Brazil": { lat: -14.2350, lon: -51.9253 },
    "Brunei": { lat: 4.5353, lon: 114.7277 },
    "Bulgaria": { lat: 42.7339, lon: 25.4858 },
    "Burkina Faso": { lat: 12.2383, lon: -1.5616 },
    "Burundi": { lat: -3.3731, lon: 29.9189 },
    "Cabo Verde": { lat: 16.0021, lon: -24.0131 },
    "Cambodia": { lat: 12.5657, lon: 104.9910 },
    "Cameroon": { lat: 7.3697, lon: 12.3547 },
    "Canada": { lat: 56.1304, lon: -106.3468 },
    "Central African Republic": { lat: 6.6111, lon: 20.9394 },
    "Chad": { lat: 15.4542, lon: 18.7322 },
    "Chile": { lat: -35.6751, lon: -71.5430 },
    "China": { lat: 35.8617, lon: 104.1954 },
    "Colombia": { lat: 4.5709, lon: -74.2973 },
    "Comoros": { lat: -11.8750, lon: 43.8722 },
    "Congo (Congo-Brazzaville)": { lat: -0.2280, lon: 15.8277 },
    "Costa Rica": { lat: 9.7489, lon: -83.7534 },
    "Croatia": { lat: 45.1000, lon: 15.2000 },
    "Cuba": { lat: 21.5217, lon: -77.7812 },
    "Cyprus": { lat: 35.1264, lon: 33.4299 },
    "Czechia (Czech Republic)": { lat: 49.8175, lon: 15.4730 },
    "Democratic Republic of the Congo": { lat: -4.0383, lon: 21.7587 },
    "Denmark": { lat: 56.2639, lon: 9.5018 },
    "Djibouti": { lat: 11.8251, lon: 42.5903 },
    "Dominica": { lat: 15.4150, lon: -61.3710 },
    "Dominican Republic": { lat: 18.7357, lon: -70.1627 },
    "Ecuador": { lat: -1.8312, lon: -78.1834 },
    "Egypt": { lat: 26.8206, lon: 30.8025 },
    "El Salvador": { lat: 13.7942, lon: -88.8965 },
    "Equatorial Guinea": { lat: 1.6508, lon: 10.2679 },
    "Eritrea": { lat: 15.1794, lon: 39.7823 },
    "Estonia": { lat: 58.5953, lon: 25.0136 },
    "Eswatini": { lat: -26.5225, lon: 31.4659 },
    "Ethiopia": { lat: 9.1450, lon: 40.4897 },
    "Fiji": { lat: -17.7134, lon: 178.0650 },
    "Finland": { lat: 61.9241, lon: 25.7482 },
    "France": { lat: 46.2276, lon: 2.2137 },
    "Gabon": { lat: -0.8037, lon: 11.6094 },
    "Gambia": { lat: 13.4432, lon: -15.3101 },
    "Georgia": { lat: 42.3154, lon: 43.3569 },
    "Germany": { lat: 51.1657, lon: 10.4515 },
    "Ghana": { lat: 7.9465, lon: -1.0232 },
    "Greece": { lat: 39.0742, lon: 21.8243 },
    "Grenada": { lat: 12.1165, lon: -61.6790 },
    "Guatemala": { lat: 15.7835, lon: -90.2308 },
    "Guinea": { lat: 9.9456, lon: -9.6966 },
    "Guinea-Bissau": { lat: 11.8037, lon: -15.1804 },
    "Guyana": { lat: 4.8604, lon: -58.9302 },
    "Haiti": { lat: 18.9712, lon: -72.2852 },
    "Honduras": { lat: 15.2000, lon: -86.2419 },
    "Hungary": { lat: 47.1625, lon: 19.5033 },
    "Iceland": { lat: 64.9631, lon: -19.0208 },
    "India": { lat: 20.5937, lon: 78.9629 },
    "Indonesia": { lat: -0.7893, lon: 113.9213 },
    "Iran": { lat: 32.4279, lon: 53.6880 },
    "Iraq": { lat: 33.2232, lon: 43.6793 },
    "Ireland": { lat: 53.1424, lon: -7.6921 },
    "Israel": { lat: 31.0461, lon: 34.8516 },
    "Italy": { lat: 41.8719, lon: 12.5674 },
    "Jamaica": { lat: 18.1096, lon: -77.2975 },
    "Japan": { lat: 36.2048, lon: 138.2529 },
    "Jordan": { lat: 30.5852, lon: 36.2384 },
    "Kazakhstan": { lat: 48.0196, lon: 66.9237 },
    "Kenya": { lat: -0.0236, lon: 37.9062 },
    "Kiribati": { lat: -3.3704, lon: -168.7340 },
    "Kuwait": { lat: 29.3117, lon: 47.4818 },
    "Kyrgyzstan": { lat: 41.2044, lon: 74.7661 },
    "Laos": { lat: 19.8563, lon: 102.4955 },
    "Latvia": { lat: 56.8796, lon: 24.6032 },
    "Lebanon": { lat: 33.8547, lon: 35.8623 },
    "Lesotho": { lat: -29.6099, lon: 28.2336 },
    "Liberia": { lat: 6.4281, lon: -9.4295 },
    "Libya": { lat: 26.3351, lon: 17.2283 },
    "Liechtenstein": { lat: 47.1660, lon: 9.5554 },
    "Lithuania": { lat: 55.1694, lon: 23.8813 },
    "Luxembourg": { lat: 49.8153, lon: 6.1296 },
    "Madagascar": { lat: -18.7669, lon: 46.8691 },
    "Malawi": { lat: -13.2543, lon: 34.3015 },
    "Malaysia": { lat: 4.2105, lon: 101.9758 },
    "Maldives": { lat: 3.2028, lon: 73.2207 },
    "Mali": { lat: 17.5707, lon: -3.9962 },
    "Malta": { lat: 35.9375, lon: 14.3754 },
    "Marshall Islands": { lat: 7.1315, lon: 171.1845 },
    "Mauritania": { lat: 21.0079, lon: -10.9408 },
    "Mauritius": { lat: -20.3484, lon: 57.5522 },
    "Mexico": { lat: 23.6345, lon: -102.5528 },
    "Micronesia": { lat: 7.4256, lon: 150.5508 },
    "Moldova": { lat: 47.4116, lon: 28.3699 },
    "Monaco": { lat: 43.7384, lon: 7.4246 },
    "Mongolia": { lat: 46.8625, lon: 103.8467 },
    "Montenegro": { lat: 42.7087, lon: 19.3744 },
    "Morocco": { lat: 31.7917, lon: -7.0926 },
    "Mozambique": { lat: -18.6657, lon: 35.5296 },
    "Myanmar (formerly Burma)": { lat: 21.9162, lon: 95.9560 },
    "Namibia": { lat: -22.9576, lon: 18.4904 },
    "Nauru": { lat: -0.5228, lon: 166.9315 },
    "Nepal": { lat: 28.3949, lon: 84.1240 },
    "Netherlands": { lat: 52.1326, lon: 5.2913 },
    "New Zealand": { lat: -40.9006, lon: 174.8860 },
    "Nicaragua": { lat: 12.8654, lon: -85.2072 },
    "Niger": { lat: 17.6078, lon: 8.0817 },
    "Nigeria": { lat: 9.0820, lon: 8.6753 },
    "North Korea": { lat: 40.3399, lon: 127.5101 },
    "North Macedonia": { lat: 41.6086, lon: 21.7453 },
    "Norway": { lat: 60.4720, lon: 8.4689 },
    "Oman": { lat: 21.5126, lon: 55.9233 },
    "Pakistan": { lat: 30.3753, lon: 69.3451 },
    "Palau": { lat: 7.5150, lon: 134.5825 },
    "Palestine State": { lat: 31.9522, lon: 35.2332 },
    "Panama": { lat: 8.5380, lon: -80.7821 },
    "Papua New Guinea": { lat: -6.314993, lon: 143.9555 },
    "Paraguay": { lat: -23.4425, lon: -58.4438 },
    "Peru": { lat: -9.1900, lon: -75.0152 },
    "Philippines": { lat: 12.8797, lon: 121.7740 },
    "Poland": { lat: 51.9194, lon: 19.1451 },
    "Portugal": { lat: 39.3999, lon: -8.2245 },
    "Qatar": { lat: 25.3548, lon: 51.1839 },
    "Romania": { lat: 45.9432, lon: 24.9668 },
    "Russia": { lat: 61.5240, lon: 105.3188 },
    "Rwanda": { lat: -1.9403, lon: 29.8739 },
    "Saint Kitts and Nevis": { lat: 17.3578, lon: -62.7830 },
    "Saint Lucia": { lat: 13.9094, lon: -60.9789 },
    "Saint Vincent and the Grenadines": { lat: 12.9843, lon: -61.2872 },
    "Samoa": { lat: -13.7590, lon: -172.1046 },
    "San Marino": { lat: 43.9424, lon: 12.4578 },
    "Sao Tome and Principe": { lat: 0.1864, lon: 6.6131 },
    "Saudi Arabia": { lat: 23.8859, lon: 45.0792 },
    "Senegal": { lat: 14.4974, lon: -14.4524 },
    "Serbia": { lat: 44.0165, lon: 21.0059 },
    "Seychelles": { lat: -4.6796, lon: 55.4920 },
    "Sierra Leone": { lat: 8.4606, lon: -11.7799 },
    "Singapore": { lat: 1.3521, lon: 103.8198 },
    "Slovakia": { lat: 48.6690, lon: 19.6990 },
    "Slovenia": { lat: 46.1512, lon: 14.9955 },
    "Solomon Islands": { lat: -9.6457, lon: 160.1562 },
    "Somalia": { lat: 5.1521, lon: 46.1996 },
    "South Africa": { lat: -30.5595, lon: 22.9375 },
    "South Korea": { lat: 35.9078, lon: 127.7669 },
    "South Sudan": { lat: 6.8770, lon: 31.3070 },
    "Spain": { lat: 40.4637, lon: -3.7492 },
    "Sri Lanka": { lat: 7.8731, lon: 80.7718 },
    "Sudan": { lat: 12.8628, lon: 30.2176 },
    "Suriname": { lat: 3.9193, lon: -56.0278 },
    "Sweden": { lat: 60.1282, lon: 18.6435 },
    "Switzerland": { lat: 46.8182, lon: 8.2275 },
    "Syria": { lat: 34.8021, lon: 38.9968 },
    "Tajikistan": { lat: 38.8610, lon: 71.2761 },
    "Tanzania": { lat: -6.3690, lon: 34.8888 },
    "Thailand": { lat: 15.8700, lon: 100.9925 },
    "Timor-Leste": { lat: -8.8742, lon: 125.7275 },
    "Togo": { lat: 8.6195, lon: 0.8248 },
    "Tonga": { lat: -21.1790, lon: -175.1982 },
    "Trinidad and Tobago": { lat: 10.6918, lon: -61.2225 },
    "Tunisia": { lat: 33.8869, lon: 9.5375 },
    "Turkey": { lat: 38.9637, lon: 35.2433 },
    "Turkmenistan": { lat: 38.9697, lon: 59.5563 },
    "Tuvalu": { lat: -7.1095, lon: 177.6493 },
    "Uganda": { lat: 1.3733, lon: 32.2903 },
    "Ukraine": { lat: 48.3794, lon: 31.1656 },
    "United Arab Emirates": { lat: 23.4241, lon: 53.8478 },
    "United Kingdom": { lat: 55.3781, lon: -3.4360 },
    "United States of America": { lat: 37.0902, lon: -95.7129 },
    "Uruguay": { lat: -32.5228, lon: -55.7658 },
    "Uzbekistan": { lat: 41.3775, lon: 64.5853 },
    "Vanuatu": { lat: -15.3767, lon: 166.9592 },
    "Venezuela": { lat: 6.4238, lon: -66.5897 },
    "Vietnam": { lat: 14.0583, lon: 108.2772 },
    "Yemen": { lat: 15.5527, lon: 48.5164 },
    "Zambia": { lat: -13.1339, lon: 27.8493 },
    "Zimbabwe": { lat: -19.0154, lon: 29.1549 }
};

// DOM Elements
const elements = {
    form: document.getElementById('predictionForm'),
    apiUrl: document.getElementById('apiUrl'),
    apiStatus: document.getElementById('apiStatus'),
    statusText: document.getElementById('statusText'),
    resultsContainer: document.getElementById('resultsContainer'),
    visualizationsContainer: document.getElementById('visualizationsContainer'),
    loadingSpinner: document.getElementById('loadingSpinner'),
    historySection: document.getElementById('historySection'),
    historyBody: document.getElementById('historyBody'),
    totalPredictions: document.getElementById('totalPredictions'),
    highRiskCount: document.getElementById('highRiskCount'),
    stableCount: document.getElementById('stableCount'),
    avgConfidence: document.getElementById('avgConfidence')
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    console.log('EcoPredict Frontend Initialized');
    populateRegions();
    checkApiHealth();
    setupEventListeners();
    setInterval(checkApiHealth, config.updateInterval);
});

// Populate Region Dropdown
function populateRegions() {
    const regionSelect = document.getElementById('region');
    // Keep the first default option
    // regionSelect.innerHTML = '<option value="" disabled selected>Select a region...</option>';
    
    // Convert object keys to array and sort alphabetically
    const sortedKeys = Object.keys(REGIONS).sort();
    
    sortedKeys.forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key;
        regionSelect.appendChild(option);
    });
}

// Setup Event Listeners
function setupEventListeners() {
    elements.form.addEventListener('submit', handlePrediction);
}

// Check API Health
async function checkApiHealth() {
    try {
        const url = `${config.apiUrl}/health`;
        const response = await fetch(url, { method: 'GET' });
        
        if (response.ok) {
            state.apiHealthy = true;
            updateApiStatus(true, 'API Connected');
        } else {
            state.apiHealthy = false;
            updateApiStatus(false, `API Error: ${response.status}`);
        }
    } catch (error) {
        state.apiHealthy = false;
        updateApiStatus(false, `Offline: ${error.message}`);
        console.error('API Health Check Error:', error);
    }
}

// Update API Status UI
function updateApiStatus(healthy, text) {
    const indicator = elements.apiStatus;
    const statusText = elements.statusText;
    
    if (healthy) {
        indicator.classList.add('online');
        indicator.classList.remove('offline');
    } else {
        indicator.classList.add('offline');
        indicator.classList.remove('online');
    }
    
    statusText.textContent = text;
}

// Test API Connection
window.testApiConnection = async function() {
    const apiUrl = elements.apiUrl.value;
    try {
        const response = await fetch(`${apiUrl}/health`, { method: 'GET' });
        if (response.ok) {
            alert('✅ API Connection Successful!');
            config.apiUrl = apiUrl;
            checkApiHealth();
        } else {
            alert('❌ API returned an error: ' + response.status);
        }
    } catch (error) {
        alert('❌ Cannot connect to API: ' + error.message);
    }
};

// Handle Prediction Submission
async function handlePrediction(e) {
    e.preventDefault();
    
    if (!state.apiHealthy) {
        showError('API is not available. Please check your connection.');
        return;
    }
    
    // Get form data
    const regionKey = document.getElementById('region').value;
    const year = parseInt(document.getElementById('year').value);
    const species = document.getElementById('species').value;
    
    // Get coordinates from region
    const coords = REGIONS[regionKey] || REGIONS["north_america"];
    const latitude = coords.lat;
    const longitude = coords.lon;
    
    // Validate inputs
    if (!validateInputs(year, species)) {
        return;
    }
    
    // Show loading spinner
    showLoading(true);
    
    try {
        // Make API request
        const response = await fetch(`${config.apiUrl}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                latitude,
                longitude,
                year,
                species
            })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Add to history
        const prediction = {
            latitude,
            longitude,
            region: regionKey,
            year,
            species,
            decline_risk: result.decline_risk,
            confidence: result.confidence,
            timestamp: new Date()
        };
        state.predictionsHistory.unshift(prediction);
        
        // Display results
        displayResults(result, prediction);
        displayVisualizations(result, latitude, longitude, year);
        updateHistoryDashboard();
        
        // Show history section
        elements.historySection.style.display = 'block';
        
    } catch (error) {
        showError(`Prediction Error: ${error.message}`);
        console.error('Prediction Error:', error);
    } finally {
        showLoading(false);
    }
}

// Validate Inputs
function validateInputs(year, species) {
    if (isNaN(year) || year < 1900 || year > 2100) {
        showError('❌ Invalid year. Must be between 1900 and 2100.');
        return false;
    }
    if (!species || species.trim() === '') {
        showError('❌ Please enter a species name.');
        return false;
    }
    return true;
}

// Display Results
function displayResults(result, prediction) {
    const riskStatus = result.decline_risk === 1 ? 'High Risk' : 'Stable';
    const riskClass = result.decline_risk === 1 ? 'high-risk' : 'stable';
    const riskEmoji = result.decline_risk === 1 ? '⚠️' : '✅';
    const confidencePercent = result.confidence != null ? (result.confidence * 100).toFixed(1) : 'N/A';
    
    // Format common names if available
    let commonNamesHtml = 'N/A';
    if (result.common_names && result.common_names.length > 0) {
        commonNamesHtml = result.common_names.filter(n => n).join(', ') || 'N/A';
    }
    
    let html = `
        <div class="prediction-box ${riskClass}">
            <h2>${riskEmoji} ${riskStatus}</h2>
            <p>Biodiversity Risk Assessment</p>
        </div>
        
        <div class="metrics-grid">
            <div class="metric">
                <div class="metric-value">${result.decline_risk === 1 ? '🔴 Yes' : '🟢 No'}</div>
                <div class="metric-label">Decline Risk</div>
            </div>
            <div class="metric">
                <div class="metric-value">${confidencePercent}%</div>
                <div class="metric-label">Prediction Score</div>
            </div>
        </div>
        
        <div style="background: var(--light-blue); padding: 1.5rem; border-radius: 8px; border-left: 4px solid var(--info-blue); margin: 1rem 0;">
            <strong>📋 Assessment Details:</strong><br>
            📝 <strong>Input Name:</strong> ${prediction.species}<br>
            🌍 <strong>Region:</strong> ${result.region || 'Unknown'}<br>
            🐝 <strong>Scientific Name:</strong> ${result.scientific_name || 'N/A'}<br>
            🏷️ <strong>Common Names:</strong> ${commonNamesHtml}<br>
            📅 <strong>Year:</strong> ${prediction.year}<br>
            🕐 <strong>Time:</strong> ${prediction.timestamp.toLocaleString()}
        </div>
    `;
    
    if (result.decline_risk === 1) {
        html += `
            <div class="warning-box">
                <strong>⚠️ HIGH RISK ALERT</strong><br><br>
                The model predicts that <strong>this species is at risk of biodiversity decline</strong> 
                in the specified location and time period.<br><br>
                <strong>Recommendations:</strong>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                <li>🛡️ Implement conservation efforts</li>
                <li>📊 Monitor population trends</li>
                <li>🌍 Restore habitat</li>
                <li>🤝 Engage local communities</li>
                </ul>
            </div>
        `;
    } else {
        html += `
            <div class="success-box">
                <strong>✅ STABLE POPULATION</strong><br><br>
                The model predicts that <strong>this species population is stable</strong> 
                in the specified location and time period.<br><br>
                <strong>Recommendations:</strong>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                <li>✅ Continue monitoring</li>
                <li>📈 Track population changes</li>
                <li>🔍 Conduct regular surveys</li>
                <li>📚 Document findings</li>
                </ul>
            </div>
        `;
    }
    
    elements.resultsContainer.innerHTML = html;
    elements.visualizationsContainer.style.display = 'block';
}

// Display Visualizations
function displayVisualizations(result, latitude, longitude, year) {
    // Gauge Chart
    displayGaugeChart(result.confidence);
    
    // Trend Chart
    displayTrendChart(result.decline_risk === 1 ? 'High Risk' : 'Stable');
    
    // Map
    displayLocationMap(latitude, longitude);
}

// Display Gauge Chart
function displayGaugeChart(confidence) {
    if (confidence == null) return;
    const confidencePercent = confidence * 100;
    
    const data = [{
        type: 'indicator',
        mode: 'gauge+number+delta',
        value: confidencePercent,
        title: { text: 'Prediction Score' },
        domain: { x: [0, 1], y: [0, 1] },
        gauge: {
            axis: { range: [null, 100] },
            bar: { color: '#4CAF50' },
            steps: [
                { range: [0, 33], color: '#FFCDD2' },
                { range: [33, 66], color: '#FFE082' },
                { range: [66, 100], color: '#C8E6C9' }
            ],
            threshold: {
                line: { color: 'red', width: 4 },
                thickness: 0.75,
                value: 90
            }
        }
    }];
    
    const layout = {
        margin: { l: 20, r: 20, t: 50, b: 20 },
        paper_bgcolor: 'rgba(240,240,240,0)',
        plot_bgcolor: 'rgba(240,240,240,0)',
        font: { size: 12 },
        height: 350
    };
    
    Plotly.newPlot('gaugeChart', data, layout, { responsive: true });
}

// Display Trend Chart
function displayTrendChart(riskStatus) {
    const years = Array.from({ length: 25 }, (_, i) => 2000 + i);
    let trendData;
    
    if (riskStatus === 'High Risk') {
        trendData = years.map((_, i) => 20 + i * 2.5);
    } else {
        trendData = years.map((_, i) => 80 - i * 0.5);
    }
    
    const data = [{
        x: years,
        y: trendData,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Population Health %',
        line: {
            color: riskStatus === 'High Risk' ? '#F44336' : '#4CAF50',
            width: 3
        },
        marker: { size: 8 },
        fill: 'tozeroy',
        fillcolor: riskStatus === 'High Risk' ? 'rgba(244, 67, 54, 0.2)' : 'rgba(76, 175, 80, 0.2)'
    }];
    
    const layout = {
        title: 'Biodiversity Trend (Simulated)',
        xaxis: { title: 'Year' },
        yaxis: { title: 'Population Health %' },
        hovermode: 'x unified',
        margin: { l: 50, r: 20, t: 50, b: 50 },
        paper_bgcolor: 'rgba(240,240,240,0)',
        plot_bgcolor: 'rgba(255,255,255,0.5)',
        font: { size: 11 },
        height: 350
    };
    
    Plotly.newPlot('trendChart', data, layout, { responsive: true });
}

// Display Location Map
function displayLocationMap(latitude, longitude) {
    const data = [{
        type: 'scattermapbox',
        lon: [longitude],
        lat: [latitude],
        mode: 'markers',
        marker: {
            size: 14,
            color: '#4CAF50',
            symbol: 'circle'
        },
        text: ['Prediction Location'],
        hoverinfo: 'text+lon+lat'
    }];
    
    const layout = {
        mapbox: { style: 'open-street-map', center: { lon: longitude, lat: latitude }, zoom: 5 },
        margin: { l: 0, r: 0, t: 30, b: 0 },
        paper_bgcolor: 'rgba(240,240,240,0)',
        height: 400
    };
    
    Plotly.newPlot('mapChart', data, layout, { responsive: true });
}

// Update History Dashboard
function updateHistoryDashboard() {
    const total = state.predictionsHistory.length;
    const highRisk = state.predictionsHistory.filter(p => p.decline_risk === 1).length;
    const stable = total - highRisk;
    const avgConfidence = total > 0 
        ? (state.predictionsHistory.reduce((sum, p) => sum + (p.confidence || 0), 0) / total * 100).toFixed(1)
        : 0;
    
    elements.totalPredictions.textContent = total;
    elements.highRiskCount.textContent = highRisk;
    elements.stableCount.textContent = stable;
    elements.avgConfidence.textContent = avgConfidence + '%';
    
    updateHistoryTable();
}

// Update History Table
function updateHistoryTable() {
    let html = '';
    
    state.predictionsHistory.slice(0, 10).forEach(prediction => {
        const time = prediction.timestamp.toLocaleTimeString();
        const location = `(${prediction.latitude.toFixed(4)}, ${prediction.longitude.toFixed(4)})`;
        const risk = prediction.decline_risk === 1 ? '🔴 High Risk' : '🟢 Stable';
        const confidence = prediction.confidence != null ? (prediction.confidence * 100).toFixed(1) + '%' : 'N/A';
        
        html += `
            <tr>
                <td>${time}</td>
                <td>${location}</td>
                <td>${prediction.year}</td>
                <td>${prediction.species}</td>
                <td>${risk}</td>
                <td>${confidence}</td>
            </tr>
        `;
    });
    
    elements.historyBody.innerHTML = html;
}

// Show/Hide Loading Spinner
function showLoading(show) {
    elements.loadingSpinner.style.display = show ? 'flex' : 'none';
}

// Show Error Message
function showError(message) {
    elements.resultsContainer.innerHTML = `<div class="warning-box">${message}</div>`;
    elements.visualizationsContainer.style.display = 'none';
}

// Export for external use
window.EcoPredict = {
    config,
    state,
    checkApiHealth,
    testApiConnection: window.testApiConnection,
    handlePrediction
};
