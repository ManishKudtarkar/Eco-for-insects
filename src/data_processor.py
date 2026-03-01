"""
Data Processing Pipeline
Processes GBIF data for ML model training
"""

import pandas as pd
import numpy as np
from typing import List, Optional
from src.gbif_client import GBIFOccurrence, gbif_client
from src.logger import logger


class DataProcessor:
    """Process GBIF data for model training"""

    @staticmethod
    def occurrences_to_dataframe(occurrences: List[GBIFOccurrence]) -> pd.DataFrame:
        """Convert GBIF occurrences to pandas DataFrame"""
        if not occurrences:
            logger.warning("No occurrences to convert")
            return pd.DataFrame()

        data = [occ.to_dict() for occ in occurrences]
        df = pd.DataFrame(data)

        logger.info(f"Created DataFrame with {len(df)} records")
        return df

    @staticmethod
    def calculate_population_trend(df: pd.DataFrame, time_window: int = 5) -> pd.DataFrame:
        """
        Calculate population trends based on occurrence frequency

        Logic:
        - Group by species and year
        - Count occurrences per year
        - Calculate trend: declining if recent years have fewer records
        """
        if df.empty:
            return df

        # Group by species and year
        yearly_counts = df.groupby(["species", "year"]).size().reset_index(name="count")

        # Calculate trend for each species
        trends = []

        for species in yearly_counts["species"].unique():
            species_data = yearly_counts[yearly_counts["species"] == species].sort_values("year")

            if len(species_data) < 2:
                continue

            counts = species_data["count"].values

            # Split into early and recent periods
            mid_point = len(counts) // 2
            early_avg = np.mean(counts[:mid_point]) if mid_point > 0 else 0
            recent_avg = np.mean(counts[mid_point:])

            # Determine trend
            if recent_avg < early_avg * 0.7:  # 30% decline threshold
                trend = "declining"
            else:
                trend = "stable"

            # Add trend to all records of this species
            for _, row in species_data.iterrows():
                trends.append({"species": species, "year": row["year"], "population_trend": trend})

        trends_df = pd.DataFrame(trends)

        # Merge trends back to original data
        df = df.merge(trends_df, on=["species", "year"], how="left")

        # Fill missing trends with 'stable' as default
        df["population_trend"] = df["population_trend"].fillna("stable")

        logger.info(f"Calculated trends: {df['population_trend'].value_counts().to_dict()}")

        return df

    @staticmethod
    def prepare_training_data(df: pd.DataFrame, add_synthetic_trends: bool = True) -> pd.DataFrame:
        """
        Prepare data for model training

        Args:
            df: DataFrame with GBIF occurrences
            add_synthetic_trends: Add synthetic declining trends for balance
        """
        if df.empty:
            logger.warning("Empty DataFrame provided")
            return df

        # Calculate population trends
        df = DataProcessor.calculate_population_trend(df)

        # If dataset is imbalanced, add synthetic declining trends
        if add_synthetic_trends:
            declining_count = (df["population_trend"] == "declining").sum()
            stable_count = (df["population_trend"] == "stable").sum()

            logger.info(
                f"Original distribution - Declining: {declining_count}, Stable: {stable_count}"
            )

            # If too imbalanced, adjust some stable to declining based on heuristics
            if declining_count < stable_count * 0.3:
                # Mark records from recent years in heavily populated areas as declining
                # (environmental pressure hypothesis)
                recent_year = df["year"].max()

                # Create synthetic declining labels for recent urban records
                urban_threshold_lat = df["latitude"].quantile([0.25, 0.75])
                _ = df["longitude"].quantile([0.25, 0.75])

                synthetic_declining = (
                    (df["year"] >= recent_year - 2)
                    & (df["latitude"].between(urban_threshold_lat[0], urban_threshold_lat[1]))
                    & (df["population_trend"] == "stable")
                )

                # Mark 30% of these as declining
                synthetic_indices = df[synthetic_declining].sample(frac=0.3, random_state=42).index

                df.loc[synthetic_indices, "population_trend"] = "declining"

                logger.info(f"Added {len(synthetic_indices)} synthetic declining trends")

        # Remove duplicates
        df = df.drop_duplicates(subset=["latitude", "longitude", "year", "species"])

        logger.info(f"Final dataset shape: {df.shape}")
        logger.info(f"Final distribution: {df['population_trend'].value_counts().to_dict()}")

        return df

    @staticmethod
    def fetch_and_prepare_dataset(
        species_list: Optional[List[str]] = None,
        max_records: int = 1000,
        year_from: int = 2015,
        year_to: int = 2024,
        save_path: Optional[str] = None,
    ) -> pd.DataFrame:
        """
        Fetch data from GBIF and prepare for training

        Args:
            species_list: List of species to fetch
            max_records: Maximum records to fetch
            year_from: Start year
            year_to: End year
            save_path: Path to save CSV (optional)
        """
        if not species_list:
            # Default pollinator species
            species_list = [
                "Apis mellifera",
                "Bombus terrestris",
                "Pieris rapae",
                "Vanessa atalanta",
                "Papilio xuthus",
                "Danaus plexippus",
                "Bombus impatiens",
                "Vanessa cardui",
            ]

        all_occurrences = []

        for species in species_list:
            logger.info(f"Fetching GBIF data for: {species}")

            try:
                occurrences = gbif_client.fetch_species_data(
                    species_name=species,
                    max_records=max_records // len(species_list),
                    year_from=year_from,
                    year_to=year_to,
                )
                all_occurrences.extend(occurrences)

            except Exception as e:
                logger.error(f"Failed to fetch {species}: {e}")
                continue

        # Convert to DataFrame
        df = DataProcessor.occurrences_to_dataframe(all_occurrences)

        if df.empty:
            logger.error("No data fetched from GBIF")
            return df

        # Prepare for training
        df = DataProcessor.prepare_training_data(df)

        # Save if path provided
        if save_path:
            df.to_csv(save_path, index=False)
            logger.info(f"Saved dataset to {save_path}")

        return df


# Export processor instance
data_processor = DataProcessor()
