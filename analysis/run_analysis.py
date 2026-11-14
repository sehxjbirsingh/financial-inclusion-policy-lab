"""Master Reproducibility Runner for Financial Inclusion Policy Lab
Executes full analytical pipeline from raw World Bank data to final clustering artifacts:
1. data_preprocessing.py -> Cleans, imputes, encodes, standardizes, and logs.
2. clustering_pipeline.py -> Evaluates K=2..10 (Euclidean vs Manhattan), computes PCA, stability, and outputs.
"""
import sys
import time
from pathlib import Path

# Add analysis directory to sys.path
ANALYSIS_DIR = Path(__file__).resolve().parent
BASE_DIR = ANALYSIS_DIR.parent
sys.path.insert(0, str(ANALYSIS_DIR))
sys.path.insert(0, str(BASE_DIR))

from data_preprocessing import run_preprocessing_pipeline
from clustering_pipeline import run_clustering_suite

def main():
    print("==========================================================")
    print("  FINANCIAL INCLUSION POLICY LAB: FULL REPRODUCIBLE RUN  ")
    print("==========================================================")
    t0 = time.time()

    print("\n[Step 1/2] Executing Data Preprocessing Pipeline...")
    prep_log = run_preprocessing_pipeline(year="2024", missing_threshold=0.40)
    print(f"-> Preprocessing done in {time.time() - t0:.2f}s across {prep_log['total_countries']} economies.")

    t1 = time.time()
    print("\n[Step 2/2] Executing Clustering & Stability Benchmarking...")
    rec = run_clustering_suite()
    print(f"-> Clustering benchmark done in {time.time() - t1:.2f}s. Recommended K={rec['recommended_k']}.")

    total_time = time.time() - t0
    print("\n==========================================================")
    print(f"  ALL ARTIFACTS REGENERATED SUCCESSFULLY IN {total_time:.2f}s!  ")
    print(f"  Artifacts stored in: {BASE_DIR / 'data' / 'processed'}")
    print("==========================================================")

if __name__ == "__main__":
    main()
