"""
API Tests
Unit and integration tests for FastAPI endpoints
"""

import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from src.api import app


@pytest.fixture
def client():
    """Test client fixture"""
    return TestClient(app)


@pytest.fixture(autouse=True)
def mock_models():
    """Mock model loading to avoid FileNotFoundError in CI"""
    with patch('src.api.model', MagicMock()), \
         patch('src.api.species_encoder', MagicMock()), \
         patch('src.api.cache', MagicMock()):
        yield


class TestHealthEndpoints:
    """Test health and basic endpoints"""
    
    def test_root_endpoint(self, client):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
    
    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data


class TestPredictionEndpoint:
    """Test prediction endpoint"""
    
    @pytest.fixture
    def valid_request(self):
        """Valid prediction request"""
        return {
            "latitude": 40.7128,
            "longitude": -74.0060,
            "year": 2024,
            "species": "Apis mellifera"
        }
    
    @patch('src.api.model')
    @patch('src.api.cache')
    def test_predict_valid_request(self, mock_cache, mock_model, client, valid_request):
        """Test prediction with valid request"""
        mock_model.predict.return_value = [0]
        mock_model.predict_proba.return_value = [[0.8, 0.2]]
        mock_cache.get.return_value = None
        mock_cache.set.return_value = True
        
        response = client.post("/predict", json=valid_request)
        assert response.status_code == 200
    
    def test_predict_invalid_latitude(self, client, valid_request):
        """Test prediction with invalid latitude"""
        valid_request["latitude"] = 100  # Invalid
        response = client.post("/predict", json=valid_request)
        assert response.status_code == 422
    
    def test_predict_invalid_longitude(self, client, valid_request):
        """Test prediction with invalid longitude"""
        valid_request["longitude"] = 200  # Invalid
        response = client.post("/predict", json=valid_request)
        assert response.status_code == 422
    
    def test_predict_missing_field(self, client):
        """Test prediction with missing required field"""
        response = client.post("/predict", json={
            "latitude": 40.7128,
            "longitude": -74.0060
            # Missing year and species
        })
        assert response.status_code == 422


class TestSpeciesEndpoint:
    """Test species listing endpoint"""
    
    @patch('src.api.species_encoder')
    def test_list_species(self, mock_encoder, client):
        """Test species listing"""
        mock_encoder.classes_ = ["Apis mellifera", "Bombus terrestris"]
        response = client.get("/species")
        assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
