// EcoPredict Frontend - JavaScript
// Connects to FastAPI backend for predictions

// Configuration
const config = {
    apiUrl: 'http://127.0.0.1:8000',
    updateInterval: 5000
};

// State
const state = {
    predictionsHistory: [],
    apiHealthy: false
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
    checkApiHealth();
    setupEventListeners();
    setInterval(checkApiHealth, config.updateInterval);
});

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
            updateApiStatus(false, 'API Error');
        }
    } catch (error) {
        state.apiHealthy = false;
        updateApiStatus(false, 'API Offline');
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
    const latitude = parseFloat(document.getElementById('latitude').value);
    const longitude = parseFloat(document.getElementById('longitude').value);
    const year = parseInt(document.getElementById('year').value);
    const species = document.getElementById('species').value;
    
    // Validate inputs
    if (!validateInputs(latitude, longitude, year, species)) {
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
function validateInputs(latitude, longitude, year, species) {
    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
        showError('❌ Invalid latitude. Must be between -90 and 90.');
        return false;
    }
    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
        showError('❌ Invalid longitude. Must be between -180 and 180.');
        return false;
    }
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
    const confidencePercent = (result.confidence * 100).toFixed(1);
    
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
                <div class="metric-label">Confidence</div>
            </div>
        </div>
        
        <div style="background: var(--light-blue); padding: 1.5rem; border-radius: 8px; border-left: 4px solid var(--info-blue); margin: 1rem 0;">
            <strong>📋 Input Summary:</strong><br>
            📍 Location: (${prediction.latitude.toFixed(4)}, ${prediction.longitude.toFixed(4)})<br>
            📅 Year: ${prediction.year}<br>
            🐝 Species: ${prediction.species}<br>
            🕐 Time: ${prediction.timestamp.toLocaleString()}
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
    const confidencePercent = confidence * 100;
    
    const data = [{
        type: 'indicator',
        mode: 'gauge+number+delta',
        value: confidencePercent,
        title: { text: 'Model Confidence' },
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
        ? (state.predictionsHistory.reduce((sum, p) => sum + p.confidence, 0) / total * 100).toFixed(1)
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
        const confidence = (prediction.confidence * 100).toFixed(1) + '%';
        
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
