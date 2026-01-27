"""
EcoPredict Model Training Script
Trains a Random Forest classifier to predict insect biodiversity decline risk
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import pickle
import os


def load_and_prepare_data(filepath="data/insect.csv", use_gbif: bool = False):
    """Load and prepare the biodiversity dataset"""
    print("Loading dataset...")

    # Option to fetch fresh data from GBIF
    if use_gbif:
        from src.data_processor import data_processor

        print("Fetching fresh data from GBIF API...")
        df = data_processor.fetch_and_prepare_dataset(max_records=1000, save_path=filepath)
        if df.empty:
            print("Failed to fetch GBIF data, trying local file...")
            use_gbif = False

    if not use_gbif:
        try:
            df = pd.read_csv(filepath)
        except FileNotFoundError:
            print(f"File {filepath} not found. Fetching from GBIF...")
            from src.data_processor import data_processor

            df = data_processor.fetch_and_prepare_dataset(max_records=1000, save_path=filepath)

    print(f"Dataset shape: {df.shape}")
    print(f"\nColumns: {df.columns.tolist()}")
    print(f"\nFirst few rows:")
    print(df.head())

    # Create decline risk label (1 = declining, 0 = stable)
    df["decline_risk"] = (df["population_trend"] == "declining").astype(int)

    print(f"\nDecline risk distribution:")
    print(df["decline_risk"].value_counts())

    return df


def encode_features(df):
    """Encode categorical features"""
    print("\nEncoding species names...")

    # Encode species
    species_encoder = LabelEncoder()
    df["species_encoded"] = species_encoder.fit_transform(df["species"])

    print(f"Number of unique species: {len(species_encoder.classes_)}")

    return df, species_encoder


def create_features(df):
    """Create feature matrix and target vector"""
    print("\nCreating feature matrix...")

    # Features: latitude, longitude, year, species_encoded
    feature_cols = ["latitude", "longitude", "year", "species_encoded"]
    X = df[feature_cols].values
    y = df["decline_risk"].values

    print(f"Feature matrix shape: {X.shape}")
    print(f"Target vector shape: {y.shape}")

    return X, y, feature_cols


def train_model(X_train, y_train):
    """Train Random Forest classifier"""
    print("\nTraining Random Forest model...")

    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )

    model.fit(X_train, y_train)

    print("Model training completed!")
    print(f"\nFeature importances:")
    return model


def evaluate_model(model, X_test, y_test, feature_cols):
    """Evaluate model performance"""
    print("\n" + "=" * 50)
    print("MODEL EVALUATION")
    print("=" * 50)

    # Predictions
    y_pred = model.predict(X_test)

    # Accuracy
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nAccuracy: {accuracy:.4f}")

    # Classification report
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["Stable", "High Risk"]))

    # Confusion matrix
    print("\nConfusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(cm)

    # Feature importance
    print("\nFeature Importances:")
    for feat, imp in zip(feature_cols, model.feature_importances_):
        print(f"  {feat}: {imp:.4f}")

    return accuracy


def save_models(model, species_encoder, model_dir="models"):
    """Save trained model and encoders"""
    print(f"\nSaving models to {model_dir}/...")

    # Create models directory if it doesn't exist
    os.makedirs(model_dir, exist_ok=True)

    # Save model
    model_path = os.path.join(model_dir, "ecopredict.pkl")
    with open(model_path, "wb") as f:
        pickle.dump(model, f)
    print(f"✓ Saved model: {model_path}")

    # Save species encoder
    encoder_path = os.path.join(model_dir, "species_encoder.pkl")
    with open(encoder_path, "wb") as f:
        pickle.dump(species_encoder, f)
    print(f"✓ Saved encoder: {encoder_path}")

    print("\nModels saved successfully!")


def main(use_gbif: bool = False):
    """Main training pipeline"""
    print("=" * 50)
    print("ECOPREDICT MODEL TRAINING")
    print("=" * 50)

    if use_gbif:
        print("\n🌍 Using GBIF.org API for real biodiversity data\n")

    # Load data
    df = load_and_prepare_data(use_gbif=use_gbif)

    # Encode features
    df, species_encoder = encode_features(df)

    # Create features
    X, y, feature_cols = create_features(df)

    # Split data
    print("\nSplitting data (80% train, 20% test)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"Train set: {X_train.shape[0]} samples")
    print(f"Test set: {X_test.shape[0]} samples")

    # Train model
    model = train_model(X_train, y_train)

    # Evaluate model
    accuracy = evaluate_model(model, X_test, y_test, feature_cols)

    # Save models
    save_models(model, species_encoder)

    print("\n" + "=" * 50)
    print("TRAINING COMPLETE!")
    print("=" * 50)
    print(f"Final Accuracy: {accuracy:.4f}")
    print("\nNext steps:")
    print("1. Run API: uvicorn src.api:app --reload")
    print("2. Run Web App: streamlit run src/app.py")


if __name__ == "__main__":
    import sys

    # Check for --gbif flag
    use_gbif = "--gbif" in sys.argv
    main(use_gbif=use_gbif)
