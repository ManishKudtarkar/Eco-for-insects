#!/usr/bin/env python3
"""Fix app.py by replacing it with a simple placeholder"""

content = '''"""
EcoPredict Streamlit Web Dashboard (Deprecated)
Use the HTML/CSS/JS frontend instead: frontend/index.html
This file is kept for backward compatibility only.
"""

import streamlit as st

st.set_page_config(
    page_title="EcoPredict - Use HTML Frontend",
    page_icon="🦋",
    layout="wide",
)

st.markdown("# 🦋 EcoPredict")
st.markdown("## ⚠️ Streamlit Frontend is Deprecated")

st.info(
    """
    **The Streamlit frontend has been replaced with a modern HTML/CSS/JS frontend.**

    Please use the new frontend instead:
    - **URL**: http://127.0.0.1:3000
    - **Start**: `python serve_frontend.py`

    The API is available at: http://127.0.0.1:8000
    """
)

st.markdown("---")
st.markdown("**Why the change?**")
st.markdown(
    """
    - ✅ Pure HTML/CSS/JS for better performance
    - ✅ Modern interactive visualizations with Plotly
    - ✅ Better responsive design
    - ✅ No Python dependencies on frontend
    - ✅ Faster load times
    """
)

st.markdown("---")
st.markdown(
    '<p style="text-align: center;">EcoPredict v1.0 | Powered by FastAPI & Vanilla JS</p>',
    unsafe_allow_html=True
)
'''

with open('src/app.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("src/app.py replaced successfully with placeholder")
