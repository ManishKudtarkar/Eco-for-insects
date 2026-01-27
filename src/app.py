"""
EcoPredict Streamlit Web Dashboard
Interactive web interface for biodiversity decline predictions
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


# Custom CSS
st.markdown(
    """
    <style>
    .main-header {
        font-size: 3rem;
        color: #2E7D32;
        text-align: center;
        margin-bottom: 1rem;
    }
    .sub-header {
        font-size: 1.2rem;
        color: #555;
        text-align: center;
        margin-bottom: 2rem;
    }
    .prediction-box {
        padding: 2rem;
        border-radius: 10px;
        margin: 1rem 0;
        text-align: center;
    }
    .stable {
        background-color: #C8E6C9;
        border: 2px solid #4CAF50;
    }
    .high-risk {
        background-color: #FFCDD2;
        border: 2px solid #F44336;
    }
    .metric-box {
        background-color: #E3F2FD;
        padding: 1rem;
        border-radius: 5px;
        margin: 0.5rem 0;
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
    """Main application"""

    # Header
    st.markdown('<h1 class="main-header">🦋 EcoPredict</h1>', unsafe_allow_html=True)
    st.markdown(
        '<p class="sub-header">AI-Powered Insect Biodiversity Decline Forecasting</p>',
        unsafe_allow_html=True,
    )

    # Sidebar
    with st.sidebar:
        st.header("⚙️ Settings")

        api_mode = st.radio(
            "Prediction Mode",
            ["API (Recommended)", "Local Model"],
            help="API mode requires the FastAPI server to be running",
        )

        if api_mode == "API (Recommended)":
            api_url = st.text_input(
                "API URL", value="http://localhost:8000", help="URL of the FastAPI server"
            )

        st.markdown("---")
        st.markdown("### About")
        st.markdown("""
        EcoPredict uses machine learning to forecast insect biodiversity decline
        based on environmental and species data.

        **Model:** Random Forest
        **Framework:** Scikit-learn
        **API:** FastAPI
        """)

    # Main content
    col1, col2 = st.columns([1, 1])

    with col1:
        st.header("📊 Input Parameters")

        # Load species list
        species_list = load_species_list()

        # Input form
        with st.form("prediction_form"):
            latitude = st.number_input(
                "Latitude",
                min_value=-90.0,
                max_value=90.0,
                value=40.7128,
                step=0.0001,
                help="Geographic latitude (-90 to 90)",
            )

            longitude = st.number_input(
                "Longitude",
                min_value=-180.0,
                max_value=180.0,
                value=-74.0060,
                step=0.0001,
                help="Geographic longitude (-180 to 180)",
            )

            year = st.number_input(
                "Year",
                min_value=1900,
                max_value=2100,
                value=datetime.now().year,
                step=1,
                help="Year of observation",
            )

            if species_list:
                species = st.selectbox(
                    "Species", options=species_list, help="Select insect species"
                )
            else:
                species = st.text_input(
                    "Species",
                    value="Apis mellifera",
                    help="Enter species name (e.g., Apis mellifera)",
                )

            submit_button = st.form_submit_button(
                "🔍 Predict Decline Risk", use_container_width=True
            )

    with col2:
        st.header("🎯 Prediction Results")

        if submit_button:
            with st.spinner("Analyzing biodiversity risk..."):
                # Make prediction
                if api_mode == "API (Recommended)":
                    result, error = make_prediction_api(latitude, longitude, year, species, api_url)
                else:
                    result, error = make_prediction_local(latitude, longitude, year, species)

                if error:
                    st.error(error)
                    if "Cannot connect to API" in error:
                        st.info("💡 Tip: Start the API server with: `uvicorn src.api:app --reload`")

                elif result:
                    # Display result
                    status = result["status"]
                    risk_class = "high-risk" if result["decline_risk"] == 1 else "stable"

                    st.markdown(
                        f'<div class="prediction-box {risk_class}">'
                        f'<h2>{"⚠️ " if result["decline_risk"] == 1 else "✅ "}{status}</h2>'
                        f"</div>",
                        unsafe_allow_html=True,
                    )

                    # Metrics
                    col_a, col_b = st.columns(2)

                    with col_a:
                        st.metric("Decline Risk", "Yes" if result["decline_risk"] == 1 else "No")

                    with col_b:
                        if "confidence" in result and result["confidence"]:
                            st.metric("Confidence", f"{result['confidence']*100:.1f}%")

                    # Input summary
                    st.markdown("### 📋 Input Summary")
                    st.markdown(
                        f"""
                    <div class="metric-box">
                    <strong>Location:</strong> ({latitude:.4f}, {longitude:.4f})<br>
                    <strong>Year:</strong> {year}<br>
                    <strong>Species:</strong> {species}
                    </div>
                    """,
                        unsafe_allow_html=True,
                    )

                    # Interpretation
                    st.markdown("### 📖 Interpretation")
                    if result["decline_risk"] == 1:
                        st.warning("""
                        **High Risk**: The model predicts that this species is at risk of
                        biodiversity decline in the specified location and time period.
                        Conservation efforts may be needed.
                        """)
                    else:
                        st.success("""
                        **Stable**: The model predicts that this species population is
                        stable in the specified location and time period.
                        """)
        else:
            st.info("👆 Enter parameters and click 'Predict Decline Risk' to get started")

    # Footer
    st.markdown("---")
    st.markdown(
        "<p style='text-align: center; color: #888;'>"
        "EcoPredict v1.0 | Built with FastAPI & Streamlit | "
        "Supporting data-driven conservation planning"
        "</p>",
        unsafe_allow_html=True,
    )


if __name__ == "__main__":
    main()
