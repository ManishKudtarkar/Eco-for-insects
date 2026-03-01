"""
GBIF Data Fetcher Script
Standalone script to fetch and explore GBIF data
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.gbif_client import gbif_client
from src.data_processor import data_processor
import argparse


def search_species_demo():
    """Demo: Search for species"""
    print("\n" + "="*60)
    print("GBIF SPECIES SEARCH DEMO")
    print("="*60)
    
    queries = ["Apis", "Bombus", "Danaus", "Pieris"]
    
    for query in queries:
        print(f"\nSearching for: {query}")
        results = gbif_client.search_species(query, limit=3)
        
        for i, species in enumerate(results, 1):
            print(f"  {i}. {species.get('scientificName', 'N/A')}")
            print(f"     Rank: {species.get('rank', 'N/A')}")
            print(f"     Kingdom: {species.get('kingdom', 'N/A')}")


def fetch_occurrences_demo(species_name: str = "Apis mellifera"):
    """Demo: Fetch occurrences for a species"""
    print("\n" + "="*60)
    print(f"FETCHING OCCURRENCES: {species_name}")
    print("="*60)
    
    occurrences = gbif_client.fetch_species_data(
        species_name=species_name,
        max_records=50,
        year_from=2020,
        year_to=2024
    )
    
    print(f"\nTotal occurrences fetched: {len(occurrences)}")
    
    if occurrences:
        print(f"\nSample records:")
        for i, occ in enumerate(occurrences[:5], 1):
            print(f"  {i}. {occ.species}")
            print(f"     Location: ({occ.latitude:.4f}, {occ.longitude:.4f})")
            print(f"     Year: {occ.year}")
            print(f"     Country: {occ.country or 'N/A'}")


def create_training_dataset(
    output_file: str = "data/gbif_training_data.csv",
    max_records: int = 1000
):
    """Create a training dataset from GBIF"""
    print("\n" + "="*60)
    print("CREATING TRAINING DATASET FROM GBIF")
    print("="*60)
    
    print(f"\nFetching up to {max_records} records...")
    print(f"Output file: {output_file}")
    
    df = data_processor.fetch_and_prepare_dataset(
        max_records=max_records,
        year_from=2015,
        year_to=2024,
        save_path=output_file
    )
    
    if not df.empty:
        print("\n✓ Dataset created successfully!")
        print(f"\nDataset statistics:")
        print(f"  Total records: {len(df)}")
        print(f"  Unique species: {df['species'].nunique()}")
        print(f"  Year range: {df['year'].min()} - {df['year'].max()}")
        print(f"  Countries: {df['country'].nunique()}")
        print(f"\nPopulation trends:")
        print(df['population_trend'].value_counts())
    else:
        print("\n✗ Failed to create dataset")


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Fetch biodiversity data from GBIF.org"
    )
    parser.add_argument(
        '--mode',
        choices=['search', 'fetch', 'dataset'],
        default='dataset',
        help='Operation mode'
    )
    parser.add_argument(
        '--species',
        type=str,
        default='Apis mellifera',
        help='Species name for fetch mode'
    )
    parser.add_argument(
        '--output',
        type=str,
        default='data/gbif_training_data.csv',
        help='Output file for dataset mode'
    )
    parser.add_argument(
        '--max-records',
        type=int,
        default=1000,
        help='Maximum records to fetch'
    )
    
    args = parser.parse_args()
    
    print("="*60)
    print("GBIF DATA FETCHER")
    print("Powered by gbif.org API")
    print("="*60)
    
    try:
        if args.mode == 'search':
            search_species_demo()
        elif args.mode == 'fetch':
            fetch_occurrences_demo(args.species)
        elif args.mode == 'dataset':
            create_training_dataset(args.output, args.max_records)
    
    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user")
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
