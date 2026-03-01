"""
Redis Caching Layer
High-performance caching for predictions
"""

import redis
import json
import hashlib
from typing import Optional, Any
from src.config import settings
from src.logger import logger


class CacheManager:
    """Redis cache manager for prediction results"""

    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self._connect()

    def _connect(self):
        """Connect to Redis"""
        if not settings.REDIS_URL:
            logger.warning("Redis URL not configured, caching disabled")
            return

        try:
            self.redis_client = redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=2,  # Reduced timeout
                socket_keepalive=False,
                socket_timeout=2,  # Add socket timeout
                retry_on_timeout=False,
            )
            # Test connection with timeout
            self.redis_client.ping()
            logger.info("Connected to Redis successfully")
        except Exception as e:
            logger.warning(f"Redis unavailable (non-critical): {e}")
            self.redis_client = None  # Disable caching gracefully

    def _generate_key(self, prefix: str, data: dict) -> str:
        """Generate cache key from data"""
        data_str = json.dumps(data, sort_keys=True)
        hash_str = hashlib.md5(data_str.encode()).hexdigest()
        return f"{prefix}:{hash_str}"

    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.redis_client:
            return None

        try:
            value = self.redis_client.get(key)
            if value:
                logger.info(f"Cache hit: {key}")
                return json.loads(value)
            logger.info(f"Cache miss: {key}")
            return None
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            return None

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set value in cache"""
        if not self.redis_client:
            return False

        try:
            ttl = ttl or settings.CACHE_TTL
            value_str = json.dumps(value)
            self.redis_client.setex(key, ttl, value_str)
            logger.info(f"Cache set: {key} (TTL: {ttl}s)")
            return True
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            return False

    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        if not self.redis_client:
            return False

        try:
            self.redis_client.delete(key)
            logger.info(f"Cache delete: {key}")
            return True
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
            return False

    def clear(self) -> bool:
        """Clear all cache"""
        if not self.redis_client:
            return False

        try:
            self.redis_client.flushdb()
            logger.warning("Cache cleared")
            return True
        except Exception as e:
            logger.error(f"Cache clear error: {e}")
            return False

    def get_prediction_cache_key(self, request_data: dict) -> str:
        """Generate cache key for prediction"""
        return self._generate_key("prediction", request_data)


# Global cache instance
cache = CacheManager()
