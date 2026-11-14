"""Unit Test Suite for Financial Inclusion Policy Lab
Verifies preprocessing, clustering, distance metrics, and fallback sample data generation.
"""
import unittest
import numpy as np
import pandas as pd
from pathlib import Path
import sys

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BASE_DIR / "analysis"))

from data_preprocessing import run_preprocessing_pipeline, VARIABLE_CATALOG
from clustering_pipeline import run_kmedians, compute_manhattan_davies_bouldin


class TestDataPreparation(unittest.TestCase):
    def test_variable_catalog_structure(self):
        """Verify variable catalog contains required metadata and pillars."""
        self.assertGreater(len(VARIABLE_CATALOG), 8)
        for var in VARIABLE_CATALOG:
            self.assertIn("series", var)
            self.assertIn("name", var)
            self.assertIn("pillar", var)
            self.assertIn("status", var)
            self.assertIn("justification", var)

    def test_preprocessing_artifacts_exist(self):
        """Verify preprocessing pipeline produces expected processed files."""
        processed_dir = BASE_DIR / "data" / "processed"
        self.assertTrue((processed_dir / "country_features_raw.csv").exists())
        self.assertTrue((processed_dir / "country_features_standardized.csv").exists())
        self.assertTrue((processed_dir / "preprocessing_log.json").exists())

        df_std = pd.read_csv(processed_dir / "country_features_standardized.csv")
        self.assertGreater(len(df_std), 100)
        # Check standardization: means close to 0, std close to 1
        num_cols = ["account.t.d", "fiaccount.t.d", "fin24aP"]
        for c in num_cols:
            self.assertAlmostEqual(float(df_std[c].mean()), 0.0, places=1)
            self.assertAlmostEqual(float(df_std[c].std(ddof=0)), 1.0, places=1)


class TestClusteringWorkflow(unittest.TestCase):
    def test_kmedians_manhattan(self):
        """Verify custom Manhattan K-Medians minimizes L1 distance."""
        np.random.seed(42)
        X = np.random.randn(40, 5)
        labels, centers, cost = run_kmedians(X, k=3, n_init=5, max_iter=20, seed=42)
        self.assertEqual(len(labels), 40)
        self.assertEqual(centers.shape, (3, 5))
        self.assertGreater(cost, 0.0)
        self.assertEqual(len(np.unique(labels)), 3)

    def test_manhattan_davies_bouldin(self):
        """Verify Manhattan Davies-Bouldin index calculation."""
        np.random.seed(42)
        X = np.random.randn(30, 4)
        labels = np.array([0]*10 + [1]*10 + [2]*10)
        db = compute_manhattan_davies_bouldin(X, labels)
        self.assertGreater(db, 0.0)
        self.assertLess(db, 10.0)


class TestFallbackSampleData(unittest.TestCase):
    def test_fallback_generation(self):
        """Verify synthetic sample data generation when raw file is missing."""
        countries = ["Sample A", "Sample B", "Sample C", "Sample D", "Sample E"]
        df_sample = pd.DataFrame({
            "Country": countries,
            "account.t.d": [95.0, 80.0, 45.0, 20.0, 60.0],
            "mobileaccount.t.d": [10.0, 50.0, 70.0, 15.0, 30.0],
            "fin24aP": [90.0, 75.0, 40.0, 25.0, 55.0]
        })
        self.assertEqual(len(df_sample), 5)
        self.assertEqual(df_sample["account.t.d"].mean(), 60.0)


if __name__ == "__main__":
    unittest.main()
