"""
Prometheus Metrics for EcoPredict
"""

from prometheus_client import Counter, Histogram

# Request metrics
REQUEST_COUNT = Counter(
    "ecopredict_requests_total", "Total API requests", ["endpoint", "method", "status"]
)

REQUEST_LATENCY = Histogram("ecopredict_request_latency_seconds", "Request latency", ["endpoint"])

# Prediction metrics
PREDICTION_COUNT = Counter(
    "ecopredict_predictions_total", "Total predictions", ["status"]  # stable or high_risk
)

CACHE_HITS = Counter("ecopredict_cache_hits_total", "Total cache hits", ["endpoint"])

EXCEPTIONS = Counter("ecopredict_exceptions_total", "Total unhandled exceptions", ["endpoint"])
