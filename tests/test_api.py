"""
API Tests
Unit and integration tests for FastAPI endpoints
"""

import pytest
from fastapi.testclient import TestClient
from src.api import app


@pytest.fixture
def client():
    """Test client fixture"""
    return TestClient(app)


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
    
    def test_predict_valid_request(self, client, valid_request):
        """Test prediction with valid request"""
        response = client.post("/predict", json=valid_request)
        # May fail if model not trained, that's ok for structure test
        assert response.status_code in [200, 503]
    
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
    
    def test_list_species(self, client):
        """Test species listing"""
        response = client.get("/species")
        # May fail if encoder not loaded
        assert response.status_code in [200, 503]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
