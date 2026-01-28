"""
EcoPredict Streamlit Web Dashboard
Interactive web interface for biodiversity decline predictions with enhanced UI
"""

import streamlit as st
import requests
import pickle
import os
from datetime import datetime

# Page configuration
st.set_page_config(
    page_title="EcoPredict - Biodiversity Forecasting",
    page_icon="🦋",
    layout="wide",
    initial_sidebar_state="expanded",
)


# Custom CSS & JavaScript for Enhanced UI
st.markdown(
    """
    <style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    
    :root {
        --primary-green: #2E7D32;
        --light-green: #4CAF50;
        --danger-red: #F44336;
        --light-red: #FFCDD2;
        --success-light: #C8E6C9;
        --info-blue: #1976D2;
        --light-blue: #E3F2FD;
        --text-dark: #212121;
        --text-light: #666;
        --border-radius: 12px;
        --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* Main Header Styling */
    .main-header {
        font-size: 3.5rem;
        background: linear-gradient(135deg, var(--primary-green) 0%, var(--light-green) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-align: center;
        margin-bottom: 0.5rem;
        font-weight: 800;
        letter-spacing: -1px;
        animation: slideInDown 0.6s ease-out;
    }
    
    .sub-header {
        font-size: 1.3rem;
        color: var(--text-light);
        text-align: center;
        margin-bottom: 2rem;
        font-weight: 500;
        animation: slideInUp 0.6s ease-out;
    }
    
    /* Prediction Box Styling */
    .prediction-box {
        padding: 2.5rem;
        border-radius: var(--border-radius);
        margin: 1rem 0;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        transition: var(--transition);
        border-left: 5px solid;
    }
    
    .prediction-box:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    }
    
    .prediction-box.stable {
        background: linear-gradient(135deg, var(--success-light) 0%, #A5D6A7 100%);
        border-left-color: var(--light-green);
    }
    
    .prediction-box.high-risk {
        background: linear-gradient(135deg, var(--light-red) 0%, #EF9A9A 100%);
        border-left-color: var(--danger-red);
    }
    
    .prediction-box h2 {
        font-size: 2rem;
        margin-bottom: 0.5rem;
        font-weight: 700;
    }
    
    /* Metric Box */
    .metric-box {
        background: linear-gradient(135deg, var(--light-blue) 0%, #BBDEFB 100%);
        padding: 1.5rem;
        border-radius: var(--border-radius);
        margin: 1rem 0;
        border-left: 4px solid var(--info-blue);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transition: var(--transition);
    }
    
    .metric-box:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }
    
    .metric-box strong {
        color: var(--primary-green);
        font-weight: 600;
    }
    
    .metric-box br {
        margin: 0.5rem 0;
    }
    
    /* Input Section */
    .input-section {
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        padding: 2rem;
        border-radius: var(--border-radius);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
    
    .input-section h3 {
        color: var(--primary-green);
        margin-bottom: 1.5rem;
        font-size: 1.5rem;
        font-weight: 700;
    }
    
    /* Result Section */
    .result-section {
        background: #fff;
        padding: 2rem;
        border-radius: var(--border-radius);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
    
    .result-section h3 {
        color: var(--primary-green);
        margin-bottom: 1.5rem;
        font-size: 1.5rem;
        font-weight: 700;
    }
    
    /* Button Styling */
    .stButton button {
        background: linear-gradient(135deg, var(--primary-green) 0%, var(--light-green) 100%) !important;
        color: white !important;
        border: none !important;
        border-radius: var(--border-radius) !important;
        padding: 1rem 2rem !important;
        font-size: 1rem !important;
        font-weight: 600 !important;
        cursor: pointer !important;
        transition: var(--transition) !important;
        box-shadow: 0 4px 15px rgba(46, 125, 50, 0.3) !important;
    }
    
    .stButton button:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 20px rgba(46, 125, 50, 0.4) !important;
    }
    
    .stButton button:active {
        transform: translateY(0) !important;
    }
    
    /* Footer */
    .footer {
        text-align: center;
        color: var(--text-light);
        padding: 2rem;
        margin-top: 3rem;
        border-top: 1px solid #eee;
        font-size: 0.95rem;
    }
    
    /* Info/Warning/Success Boxes */
    .info-box, .warning-box, .success-box {
        padding: 1.5rem;
        border-radius: var(--border-radius);
        border-left: 4px solid;
        margin: 1rem 0;
        animation: slideIn 0.4s ease-out;
    }
    
    .info-box {
        background-color: var(--light-blue);
        border-left-color: var(--info-blue);
        color: #0D47A1;
    }
    
    .warning-box {
        background-color: var(--light-red);
        border-left-color: var(--danger-red);
        color: #B71C1C;
    }
    
    .success-box {
        background-color: var(--success-light);
        border-left-color: var(--light-green);
        color: #1B5E20;
    }
    
    /* Animations */
    @keyframes slideInDown {
        from {
            opacity: 0;
            transform: translateY(-30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.7;
        }
    }
    
    .loading {
        animation: pulse 1.5s infinite;
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
        .main-header {
            font-size: 2rem;
        }
        
        .sub-header {
            font-size: 1rem;
        }
        
        .prediction-box {
            padding: 1.5rem;
        }
        
        .prediction-box h2 {
            font-size: 1.5rem;
        }
    }
    
    /* Custom scrollbar */
    ::-webkit-scrollbar {
        width: 8px;
    }
    
    ::-webkit-scrollbar-track {
        background: #f1f1f1;
    }
    
    ::-webkit-scrollbar-thumb {
        background: var(--primary-green);
        border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
        background: var(--light-green);
    }
    </style>
""",
    unsafe_allow_html=True,
)


def load_species_list():
    """Load available species from encoder"""
    try:
        encoder_path = "models/species_encoder.pkl"
        if os.path.exists(encoder_path):
            with open(encoder_path, "rb") as f:
                encoder = pickle.load(f)
            return encoder.classes_.tolist()
        else:
            return []
    except Exception as e:
        st.error(f"Error loading species list: {e}")
        return []


def make_prediction_api(latitude, longitude, year, species, api_url="http://localhost:8000"):
    """Make prediction via API"""
    try:
        response = requests.post(
            f"{api_url}/predict",
            json={"latitude": latitude, "longitude": longitude, "year": year, "species": species},
            timeout=10,
        )

        if response.status_code == 200:
            return response.json(), None
        else:
            return None, f"API Error: {response.status_code} - {response.text}"

    except requests.exceptions.ConnectionError:
        return (
            None,
            "Cannot connect to API. Make sure the API is running: uvicorn src.api:app --reload",
        )
    except Exception as e:
        return None, f"Error: {str(e)}"


def make_prediction_local(latitude, longitude, year, species):
    """Make prediction using local model (fallback)"""
    try:
        import numpy as np

        # Load models
        with open("models/ecopredict.pkl", "rb") as f:
            model = pickle.load(f)
        with open("models/species_encoder.pkl", "rb") as f:
            encoder = pickle.load(f)

        # Encode species
        if species in encoder.classes_:
            species_encoded = encoder.transform([species])[0]
        else:
            species_encoded = 0

        # Create features
        features = np.array([[latitude, longitude, year, species_encoded]])

        # Predict
        prediction = model.predict(features)[0]
        probabilities = model.predict_proba(features)[0]
        confidence = float(max(probabilities))

        return {
            "decline_risk": int(prediction),
            "status": "High Risk" if prediction == 1 else "Stable",
            "confidence": confidence,
        }, None

    except Exception as e:
        return None, f"Local prediction error: {str(e)}"


def main():
    """Main application with enhanced UI"""

    # Header with animation
    st.markdown('<h1 class="main-header">🦋 EcoPredict</h1>', unsafe_allow_html=True)
    st.markdown(
        '<p class="sub-header">AI-Powered Insect Biodiversity Decline Forecasting</p>',
        unsafe_allow_html=True,
    )

    # Sidebar Configuration
    with st.sidebar:
        st.markdown("### ⚙️ Settings & Configuration")
        st.markdown("---")

        # Mode Selection
        api_mode = st.radio(
            "📡 Prediction Mode",
            ["API (Recommended)", "Local Model"],
            help="API mode requires the FastAPI server running on localhost:8000",
            key="api_mode",
        )

        if api_mode == "API (Recommended)":
            api_url = st.text_input(
                "🔗 API URL",
                value="http://localhost:8000",
                help="URL of the FastAPI server",
                key="api_url",
            )
        else:
            api_url = None

        st.markdown("---")
        st.markdown("### 📚 About EcoPredict")
        st.markdown("""
        **EcoPredict** uses cutting-edge machine learning to forecast 
        insect biodiversity decline based on:
        
        - 📍 Geographic location (latitude, longitude)
        - 📅 Temporal data (year of observation)
        - 🐝 Species information
        
        **Technology Stack:**
        - 🤖 Model: Random Forest Classifier
        - 📊 Framework: Scikit-learn
        - 🚀 API: FastAPI
        - 🎨 UI: Streamlit
        
        **Use Cases:**
        - Conservation planning
        - Environmental monitoring
        - Species protection
        - Risk assessment
        """)

        st.markdown("---")
        st.markdown("### 🔗 Quick Links")
        col1, col2 = st.columns(2)
        with col1:
            if st.button("📡 API Health"):
                try:
                    response = requests.get(
                        f"{api_url}/health" if api_mode == "API (Recommended)" else "",
                        timeout=5,
                    )
                    if response.status_code == 200:
                        st.success("✅ API is running")
                    else:
                        st.error("❌ API error")
                except:
                    st.error("❌ Cannot reach API")
        
        with col2:
            if st.button("📊 API Metrics"):
                try:
                    response = requests.get(
                        f"{api_url}/metrics" if api_mode == "API (Recommended)" else "",
                        timeout=5,
                    )
                    if response.status_code == 200:
                        st.success("✅ Metrics available")
                except:
                    st.error("❌ Cannot reach metrics")

    # Main content area with two columns
    col1, col2 = st.columns([1, 1], gap="large")

    with col1:
        st.markdown('<div class="input-section">', unsafe_allow_html=True)
        st.markdown("### 📊 Input Parameters")

        # Load species list
        species_list = load_species_list()

        # Input form with validation
        with st.form("prediction_form", clear_on_submit=True):
            latitude = st.number_input(
                "📍 Latitude",
                min_value=-90.0,
                max_value=90.0,
                value=40.7128,
                step=0.0001,
                help="Geographic latitude (-90 to 90) | Example: 40.7128 for New York",
            )

            longitude = st.number_input(
                "📍 Longitude",
                min_value=-180.0,
                max_value=180.0,
                value=-74.0060,
                step=0.0001,
                help="Geographic longitude (-180 to 180) | Example: -74.0060 for New York",
            )

            year = st.number_input(
                "📅 Year",
                min_value=1900,
                max_value=2100,
                value=datetime.now().year,
                step=1,
                help="Year of observation",
            )

            if species_list:
                species = st.selectbox(
                    "🐝 Species",
                    options=species_list,
                    help="Select insect species from trained model",
                )
            else:
                species = st.text_input(
                    "🐝 Species",
                    value="Apis mellifera",
                    help="Enter species name (e.g., Apis mellifera, Bombus terrestris)",
                )

            submit_button = st.form_submit_button(
                "🔍 Predict Decline Risk",
                use_container_width=True,
            )

        st.markdown("</div>", unsafe_allow_html=True)

    with col2:
        st.markdown('<div class="result-section">', unsafe_allow_html=True)
        st.markdown("### 🎯 Prediction Results")

        if submit_button:
            with st.spinner("🔬 Analyzing biodiversity risk..."):
                # Input validation
                if latitude < -90 or latitude > 90:
                    st.error("❌ Invalid latitude. Must be between -90 and 90.")
                elif longitude < -180 or longitude > 180:
                    st.error("❌ Invalid longitude. Must be between -180 and 180.")
                elif year < 1900 or year > 2100:
                    st.error("❌ Invalid year. Must be between 1900 and 2100.")
                else:
                    # Make prediction
                    if api_mode == "API (Recommended)":
                        result, error = make_prediction_api(latitude, longitude, year, species, api_url)
                    else:
                        result, error = make_prediction_local(latitude, longitude, year, species)

                    if error:
                        st.error(f"❌ {error}")
                        if "Cannot connect to API" in str(error):
                            st.markdown("""
                            <div class="info-box">
                            💡 <strong>Tip:</strong> Start the API server with:<br>
                            <code>uvicorn src.api:app --reload</code>
                            </div>
                            """, unsafe_allow_html=True)

                    elif result:
                        # Display result with styling
                        status = result["status"]
                        risk_class = "high-risk" if result["decline_risk"] == 1 else "stable"
                        risk_emoji = "⚠️" if result["decline_risk"] == 1 else "✅"

                        st.markdown(
                            f'<div class="prediction-box {risk_class}">'
                            f'<h2>{risk_emoji} {status}</h2>'
                            f"<p style='font-size: 1rem; opacity: 0.9;'>Biodiversity Risk Assessment</p>"
                            f"</div>",
                            unsafe_allow_html=True,
                        )

                        # Metrics in columns
                        st.markdown("### 📈 Key Metrics")
                        col_a, col_b = st.columns(2)

                        with col_a:
                            risk_value = "🔴 Yes - High Risk" if result["decline_risk"] == 1 else "🟢 No - Stable"
                            st.metric(
                                "Decline Risk",
                                risk_value,
                                delta=None,
                            )

                        with col_b:
                            if "confidence" in result and result["confidence"]:
                                confidence_pct = f"{result['confidence']*100:.1f}%"
                                st.metric(
                                    "Model Confidence",
                                    confidence_pct,
                                    delta=None,
                                )

                        # Input summary
                        st.markdown("### 📋 Input Summary")
                        st.markdown(
                            f"""
                        <div class="metric-box">
                        <strong>📍 Location:</strong> ({latitude:.4f}, {longitude:.4f})<br>
                        <strong>📅 Year:</strong> {year}<br>
                        <strong>🐝 Species:</strong> {species}<br>
                        <strong>🕐 Prediction Time:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
                        </div>
                        """,
                            unsafe_allow_html=True,
                        )

                        # Detailed interpretation
                        st.markdown("### 📖 Detailed Interpretation")
                        if result["decline_risk"] == 1:
                            st.markdown("""
                            <div class="warning-box">
                            <strong>⚠️ HIGH RISK ALERT</strong><br><br>
                            The model predicts that <strong>this species is at risk of biodiversity decline</strong> 
                            in the specified location and time period.<br><br>
                            <strong>Recommendations:</strong>
                            - 🛡️ Implement conservation efforts
                            - 📊 Monitor population trends
                            - 🌍 Restore habitat
                            - 🤝 Engage local communities
                            </div>
                            """, unsafe_allow_html=True)
                        else:
                            st.markdown("""
                            <div class="success-box">
                            <strong>✅ STABLE POPULATION</strong><br><br>
                            The model predicts that <strong>this species population is stable</strong> 
                            in the specified location and time period.<br><br>
                            <strong>Recommendations:</strong>
                            - ✅ Continue monitoring
                            - 📈 Track population changes
                            - 🔍 Conduct regular surveys
                            - 📚 Document findings
                            </div>
                            """, unsafe_allow_html=True)

        else:
            st.markdown("""
            <div class="info-box">
            👆 <strong>Get Started:</strong><br>
            1. Enter the location coordinates and year<br>
            2. Select or enter the species name<br>
            3. Click "Predict Decline Risk" to analyze
            </div>
            """, unsafe_allow_html=True)

        st.markdown("</div>", unsafe_allow_html=True)

    # Footer
    st.markdown("---")
    st.markdown(
        """
        <div class="footer">
        <strong>🦋 EcoPredict v1.0</strong><br>
        AI-Powered Biodiversity Forecasting System<br>
        Built with ❤️ using FastAPI, Streamlit & Scikit-learn<br>
        <small>Supporting data-driven conservation planning worldwide 🌍</small>
        </div>
        """,
        unsafe_allow_html=True,
    )


if __name__ == "__main__":
    main()
