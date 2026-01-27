"""
GBIF API Client
Integrates with Global Biodiversity Information Facility (gbif.org)
"""

import requests
from typing import Optional, List, Dict, Any
from dataclasses import dataclass
from datetime import datetime
import time
from src.logger import logger


@dataclass
class GBIFOccurrence:
    """GBIF occurrence record"""

    key: int
    species: str
    scientific_name: str
    latitude: float
    longitude: float
    year: int
    month: Optional[int]
    country: Optional[str]
    basis_of_record: Optional[str]
    individual_count: Optional[int]

    def to_dict(self) -> dict:
        """Convert to dictionary"""
        return {
            "key": self.key,
            "species": self.species,
            "scientific_name": self.scientific_name,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "year": self.year,
            "month": self.month,
            "country": self.country,
            "basis_of_record": self.basis_of_record,
            "individual_count": self.individual_count,
        }


class GBIFClient:
    """Client for GBIF API"""

    BASE_URL = "https://api.gbif.org/v1"

    def __init__(self, timeout: int = 30):
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update(
            {"User-Agent": "EcoPredict/1.0 (https://github.com/ecopredict)"}
        )

    def _make_request(self, endpoint: str, params: Optional[Dict] = None) -> Dict:
        """Make HTTP request to GBIF API"""
        url = f"{self.BASE_URL}/{endpoint}"

        try:
            response = self.session.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"GBIF API request failed: {e}")
            raise

    def search_occurrences(
        self,
        scientific_name: Optional[str] = None,
        country: Optional[str] = None,
        year: Optional[int] = None,
        has_coordinate: bool = True,
        limit: int = 300,
        offset: int = 0,
    ) -> Dict[str, Any]:
        """
        Search for species occurrences

        Args:
            scientific_name: Scientific name of species (e.g., "Apis mellifera")
            country: Two-letter country code (e.g., "US")
            year: Year of observation
            has_coordinate: Only return records with coordinates
            limit: Maximum number of results (max 300 per request)
            offset: Offset for pagination

        Returns:
            Dictionary with results and metadata
        """
        params = {
            "limit": min(limit, 300),
            "offset": offset,
            "hasCoordinate": str(has_coordinate).lower(),
        }

        if scientific_name:
            params["scientificName"] = scientific_name
        if country:
            params["country"] = country
        if year:
            params["year"] = year

        logger.info(f"Searching GBIF occurrences: {params}")
        return self._make_request("occurrence/search", params)

    def get_occurrence_by_id(self, occurrence_key: int) -> Dict:
        """Get single occurrence by key"""
        return self._make_request(f"occurrence/{occurrence_key}")

    def parse_occurrence(self, record: Dict) -> Optional[GBIFOccurrence]:
        """Parse GBIF occurrence record"""
        try:
            # Validate required fields
            if not all(
                key in record for key in ["key", "species", "decimalLatitude", "decimalLongitude"]
            ):
                return None

            # Extract year from eventDate if not present
            year = record.get("year")
            if not year and "eventDate" in record:
                try:
                    event_date = datetime.fromisoformat(record["eventDate"].replace("Z", "+00:00"))
                    year = event_date.year
                except:
                    pass

            if not year:
                return None

            return GBIFOccurrence(
                key=record["key"],
                species=record.get("species", record.get("scientificName", "Unknown")),
                scientific_name=record.get("scientificName", ""),
                latitude=float(record["decimalLatitude"]),
                longitude=float(record["decimalLongitude"]),
                year=int(year),
                month=record.get("month"),
                country=record.get("country"),
                basis_of_record=record.get("basisOfRecord"),
                individual_count=record.get("individualCount"),
            )
        except (KeyError, ValueError, TypeError) as e:
            logger.warning(f"Failed to parse occurrence: {e}")
            return None

    def fetch_species_data(
        self,
        species_name: str,
        max_records: int = 1000,
        year_from: Optional[int] = None,
        year_to: Optional[int] = None,
    ) -> List[GBIFOccurrence]:
        """
        Fetch occurrence data for a species

        Args:
            species_name: Scientific name of species
            max_records: Maximum number of records to fetch
            year_from: Start year (optional)
            year_to: End year (optional)

        Returns:
            List of GBIFOccurrence objects
        """
        occurrences = []
        offset = 0
        batch_size = 300

        logger.info(f"Fetching GBIF data for species: {species_name}")

        while len(occurrences) < max_records:
            try:
                # Add rate limiting to be nice to GBIF API
                time.sleep(0.5)

                result = self.search_occurrences(
                    scientific_name=species_name, limit=batch_size, offset=offset
                )

                if not result.get("results"):
                    break

                for record in result["results"]:
                    occurrence = self.parse_occurrence(record)
                    if occurrence:
                        # Filter by year range if specified
                        if year_from and occurrence.year < year_from:
                            continue
                        if year_to and occurrence.year > year_to:
                            continue

                        occurrences.append(occurrence)

                # Check if we've reached the end
                if result.get("endOfRecords", True):
                    break

                offset += batch_size

                logger.info(f"Fetched {len(occurrences)} occurrences so far...")

            except Exception as e:
                logger.error(f"Error fetching GBIF data: {e}")
                break

        logger.info(f"Total occurrences fetched: {len(occurrences)}")
        return occurrences[:max_records]

    def search_species(self, query: str, limit: int = 20) -> List[Dict]:
        """
        Search for species by name

        Args:
            query: Species name query
            limit: Maximum number of results

        Returns:
            List of species matches
        """
        params = {
            "q": query,
            "limit": limit,
            "datasetKey": "7ddf754f-d193-4cc9-b351-99906754a03b",  # GBIF Backbone Taxonomy
        }

        try:
            result = self._make_request("species/search", params)
            return result.get("results", [])
        except Exception as e:
            logger.error(f"Species search failed: {e}")
            return []

    def get_species_info(self, scientific_name: str) -> Optional[Dict]:
        """Get detailed species information"""
        species_list = self.search_species(scientific_name, limit=1)

        if not species_list:
            return None

        species = species_list[0]

        try:
            # Get full species details
            species_key = species.get("key")
            if species_key:
                return self._make_request(f"species/{species_key}")
        except Exception as e:
            logger.error(f"Failed to get species info: {e}")

        return species

    def fetch_insect_dataset(
        self,
        insect_families: Optional[List[str]] = None,
        max_per_family: int = 100,
        year_from: int = 2015,
        year_to: int = 2024,
    ) -> List[GBIFOccurrence]:
        """
        Fetch comprehensive insect dataset from GBIF

        Args:
            insect_families: List of insect family names (default: common pollinators)
            max_per_family: Maximum records per family
            year_from: Start year
            year_to: End year

        Returns:
            List of occurrences
        """
        if not insect_families:
            # Default to common pollinator families
            insect_families = [
                "Apidae",  # Bees
                "Nymphalidae",  # Brush-footed butterflies
                "Pieridae",  # Whites and yellows
                "Papilionidae",  # Swallowtails
            ]

        all_occurrences = []

        for family in insect_families:
            logger.info(f"Fetching data for family: {family}")

            try:
                time.sleep(1)  # Rate limiting

                # Search by taxonomic family
                result = self.search_occurrences(limit=max_per_family, has_coordinate=True)

                # Add family parameter in URL manually
                params = {
                    "family": family,
                    "limit": max_per_family,
                    "hasCoordinate": "true",
                    "year": f"{year_from},{year_to}",
                }

                result = self._make_request("occurrence/search", params)

                if result.get("results"):
                    for record in result["results"]:
                        occurrence = self.parse_occurrence(record)
                        if occurrence and year_from <= occurrence.year <= year_to:
                            all_occurrences.append(occurrence)

                logger.info(f"Fetched {len(result.get('results', []))} records for {family}")

            except Exception as e:
                logger.error(f"Error fetching family {family}: {e}")
                continue

        logger.info(f"Total insect occurrences: {len(all_occurrences)}")
        return all_occurrences


# Global GBIF client instance
gbif_client = GBIFClient()
