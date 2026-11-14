"""Data preparation, K-Means comparison and interpretation helpers."""
from __future__ import annotations

import io
import re
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.impute import SimpleImputer
from sklearn.metrics import adjusted_rand_score, silhouette_score
from scipy.spatial.distance import cdist
from sklearn.preprocessing import StandardScaler


class AnalysisError(ValueError):
    pass


COUNTRY_KEYS = ("country", "country name", "economy", "economy name", "country/economy" , "countrynewwb")
YEAR_KEYS = ("year", "survey year", "time", "period")
INDICATOR_KEYS = ("indicator", "indicator name", "series name", "series", "variable", "measure")
VALUE_KEYS = ("value", "estimate", "observation", "data value")
AGGREGATE_WORDS = ("world", "income", "region", "total", "aggregate", "euro area", "oecd")


def _find_col(columns, options):
    lookup = {str(c).strip().lower(): c for c in columns}
    for key in options:
        if key in lookup:
            return lookup[key]
    for c in columns:
        if any(key in str(c).strip().lower() for key in options):
            return c
    return None


def _read(file) -> pd.DataFrame:
    suffix = Path(file.filename).suffix.lower()
    raw = file.read()
    try:
        if suffix == ".csv":
            df = pd.read_csv(io.BytesIO(raw))
        elif suffix in (".xlsx", ".xls"):
            df = pd.read_excel(io.BytesIO(raw))
        else:
            raise AnalysisError("Upload a .csv, .xlsx, or .xls file.")
    except AnalysisError:
        raise
    except Exception as exc:
        raise AnalysisError(f"Could not read the upload: {exc}") from exc
    df.columns = [str(c).strip() for c in df.columns]
    df = df.dropna(how="all")
    if df.empty:
        raise AnalysisError("The uploaded sheet has no rows.")
    return df


def _year_columns(df):
    out = {}
    for col in df.columns:
        match = re.search(r"(?<!\d)(2011|2014|2017|2021|2024|2025)(?!\d)", str(col))
        if match:
            out[col] = match.group(1)
    return out


def _to_country_matrix(df, year):
        # Handle the World Bank Global Findex 2025 country-level dataset.
    if {"countrynewwb", "year", "group", "group2"}.issubset(df.columns):
        df = df.copy()

        df["year"] = df["year"].astype(str).str.strip()

        df = df[
            (df["year"] == str(year)) &
            (df["group"].astype(str).str.lower() == "all") &
            (df["group2"].astype(str).str.lower() == "all")
        ]

        if df.empty:
            raise AnalysisError(
                f"No overall country-level observations found for {year}."
            )

        df = df.rename(columns={"countrynewwb": "Country"})

        return df.drop(
            columns=["year", "group", "group2"],
            errors="ignore"
        ).reset_index(drop=True)
    
    country = _find_col(df.columns, COUNTRY_KEYS)
    if country is None:
        raise AnalysisError("Could not identify a country column. Name it Country or Country Name.")
    year_col = _find_col(df.columns, YEAR_KEYS)
    indicator = _find_col(df.columns, INDICATOR_KEYS)
    value = _find_col(df.columns, VALUE_KEYS)

    # Long form: one row per country, indicator and year.
    if year_col and indicator and value:
        selected = df[df[year_col].astype(str).str.extract(r"(20\d{2})", expand=False) == str(year)]
        if selected.empty:
            raise AnalysisError(f"No rows found for {year}. Check the selected survey year.")
        matrix = selected.pivot_table(index=country, columns=indicator, values=value, aggfunc="mean")
        return matrix.reset_index().rename(columns={country: "Country"})

    # World Bank country export: each row is a country/indicator, with survey years as columns.
    years = _year_columns(df)
    if indicator and years and str(year) in years.values():
        year_field = next(c for c, y in years.items() if y == str(year))
        selected = df[[country, indicator, year_field]].copy()
        selected = selected.rename(columns={country: "Country", year_field: "Value"}).dropna(subset=["Value"])
        if not selected.empty:
            return selected.pivot_table(index="Country", columns=indicator, values="Value", aggfunc="mean").reset_index()

    # Wide form with a country column and one indicator per feature, optionally suffixed by year.
    # If multiple year-tagged feature columns exist, retain only the requested year.
    year_matches = _year_columns(df)
    if year_matches and str(year) in year_matches.values():
        selected_year_cols = [c for c, y in year_matches.items() if y == str(year)]
        if len(selected_year_cols) > 1:
            result = df[[country] + selected_year_cols].copy()
            result.columns = ["Country"] + [re.sub(r"[ _-]*(2011|2014|2017|2021|2024|2025).*", "", c).strip(" _-") for c in selected_year_cols]
            return result
        # Standard World Bank country-level flat file: country rows and indicators as columns.
        # Year column represents a survey value; filtering to that year is only safe when each row is indicator-level.
    if year_col and year_col != country:
        year_values = df[year_col].astype(str).str.extract(r"(20\d{2})", expand=False)
        if str(year) in set(year_values.dropna()):
            df = df.loc[year_values == str(year)]
    return df.rename(columns={country: "Country"})


def _numeric_features(matrix):
    cols = [c for c in matrix.columns if c != "Country"]
    for col in cols:
        matrix[col] = pd.to_numeric(matrix[col].astype(str).str.replace(",", "", regex=False)
                                     .str.replace("%", "", regex=False).str.strip(), errors="coerce")
    return matrix, [c for c in cols if matrix[c].notna().any()]


def _davies_bouldin(X, labels, metric):
    """Davies–Bouldin index for Euclidean or Manhattan geometry."""
    clusters = np.unique(labels)
    centers, scatters = [], []
    for cluster in clusters:
        points = X[labels == cluster]
        centers.append(points.mean(axis=0))
        scatters.append(float(cdist(points, points.mean(axis=0, keepdims=True), metric=metric).mean()))
    center_distances = cdist(np.asarray(centers), np.asarray(centers), metric=metric)
    ratios = []
    for i in range(len(clusters)):
        candidates = [(scatters[i] + scatters[j]) / center_distances[i, j]
                      for j in range(len(clusters)) if i != j and center_distances[i, j] > 0]
        ratios.append(max(candidates) if candidates else 0.0)
    return float(np.mean(ratios))


def inspect_upload(file, year):
    matrix = _to_country_matrix(_read(file), year or "2021")
    if "Country" not in matrix:
        raise AnalysisError("Could not identify a country column. Name it Country or Country Name.")
    matrix, numeric = _numeric_features(matrix)
    numeric = [c for c in numeric if not re.search(r"(^| )(code|id)$", str(c), re.I)]
    if not numeric:
        raise AnalysisError("No numeric indicator columns detected for this year.")
    return {"features": numeric, "rows": int(matrix["Country"].nunique())}


def analyze_upload(file, year, features, k_min, k_max, selected_k, missing_threshold):
    if not year:
        raise AnalysisError("Choose the survey year represented in the upload.")
    if not (2 <= k_min <= k_max <= 12):
        raise AnalysisError("Use a cluster-count range from 2 to 12, with minimum no greater than maximum.")
    if not (0 <= missing_threshold < 0.8):
        raise AnalysisError("Missingness threshold must be between 0 and 0.79.")
    raw = _read(file)
    matrix = _to_country_matrix(raw, year)
    if "Country" not in matrix:
        raise AnalysisError("Could not create a country-level feature table from this file.")
    matrix["Country"] = matrix["Country"].astype(str).str.strip()
    matrix = matrix[~matrix["Country"].str.lower().str.contains("|".join(AGGREGATE_WORDS), na=False)]
    matrix, numeric = _numeric_features(matrix)
    # Remove common identifiers accidentally parsed as numeric features.
    numeric = [c for c in numeric if not re.search(r"(^| )(code|id)$", str(c), re.I)]
    if not features:
        features = numeric
    features = [f for f in features if f in numeric]
    if len(features) < 2:
        raise AnalysisError("Select at least two numeric financial-inclusion indicators.")
    subset = matrix[["Country"] + features].replace([np.inf, -np.inf], np.nan)
    missing = subset[features].isna().mean()
    retained = [f for f in features if missing[f] <= missing_threshold]
    dropped = [f for f in features if f not in retained]
    if len(retained) < 2:
        raise AnalysisError("Fewer than two indicators remain after the missingness rule. Raise the threshold or choose different indicators.")
    subset = subset[["Country"] + retained].drop_duplicates("Country").reset_index(drop=True)
    if len(subset) < max(k_max + 1, 5):
        raise AnalysisError(f"Only {len(subset)} countries have usable data. Need at least {max(k_max + 1, 5)} for this k range.")
    imputer = SimpleImputer(strategy="median")
    scaler = StandardScaler()
    X = scaler.fit_transform(imputer.fit_transform(subset[retained]))

    max_allowed = min(12, len(subset) - 1)
    if k_max > max_allowed:
        raise AnalysisError(f"With {len(subset)} usable countries, maximum k is {max_allowed}.")
    rows, models = [], {}
    for k in range(k_min, k_max + 1):
        model = KMeans(n_clusters=k, random_state=42, n_init=20, algorithm="lloyd")
        labels = model.fit_predict(X)
        models[k] = (model, labels)
        seed_ari = []
        for seed in (7, 21, 42, 84, 126):
            seed_labels = KMeans(n_clusters=k, random_state=seed, n_init=20).fit_predict(X)
            seed_ari.append(float(adjusted_rand_score(labels, seed_labels)))
        row = {"k": k, "wcss": float(model.inertia_), "silhouette_euclidean": None,
               "silhouette_manhattan": None, "db_euclidean": None, "db_manhattan": None,
               "mean_seed_ari": float(np.mean(seed_ari))}
        if len(set(labels)) > 1 and len(set(labels)) < len(labels):
            row["silhouette_euclidean"] = float(silhouette_score(X, labels, metric="euclidean"))
            row["silhouette_manhattan"] = float(silhouette_score(X, labels, metric="manhattan"))
            row["db_euclidean"] = _davies_bouldin(X, labels, "euclidean")
            row["db_manhattan"] = _davies_bouldin(X, labels, "cityblock")
        rows.append(row)
    if selected_k not in models:
        selected_k = min(max(selected_k, k_min), k_max)
    model, labels = models[selected_k]
    pca = PCA(n_components=2, random_state=42)
    coordinates = pca.fit_transform(X)
    assigned = subset[["Country"]].copy()
    assigned["cluster"] = labels.astype(int)
    assigned["pc1"] = coordinates[:, 0]
    assigned["pc2"] = coordinates[:, 1]
    country_rows = []
    for _, row in assigned.iterrows():
        country_rows.append({"country": row.Country, "cluster": int(row.cluster), "pc1": float(row.pc1), "pc2": float(row.pc2)})
    profile = subset.copy()
    profile["cluster"] = labels
    raw_profiles = profile.groupby("cluster")[retained].mean()
    overall = subset[retained].mean()
    std = subset[retained].std(ddof=0).replace(0, 1)
    standardized_profiles = (raw_profiles - overall) / std
    profiles = []
    for cluster in raw_profiles.index:
        profiles.append({"cluster": int(cluster), "countries": int((labels == cluster).sum()),
                         "features": [{"name": f, "mean": float(raw_profiles.loc[cluster, f]),
                                       "relative_z": float(standardized_profiles.loc[cluster, f])} for f in retained]})
    # Feature contribution is a descriptive between-cluster separation measure, not causal importance.
    between = standardized_profiles.var(axis=0, ddof=0)
    contribution = (between / (between.sum() or 1)).sort_values(ascending=False)
    selected_metrics = next(row for row in rows if row["k"] == selected_k)
    return {
        "summary": {"countries": len(subset), "features": retained, "dropped_features": dropped,
                    "missing_cells_before_imputation": int(subset[retained].isna().sum().sum()),
                    "explained_variance_pca": [float(x) for x in pca.explained_variance_ratio_],
                    "selected_k": selected_k, "year": str(year),
                    "imputation": "Median within each indicator; standard scaling (z-scores); fixed random seed 42; K-Means n_init=20."},
        "metrics": rows, "countries_data": country_rows, "profiles": profiles,
        "contributions": [{"feature": f, "share": float(v)} for f, v in contribution.items()],
        "stability": {"mean_ari": selected_metrics["mean_seed_ari"],
                      "interpretation": "Per-k ARI compares repeated seeds with the selected-seed result; it measures initialization sensitivity, not temporal or sample stability."},
        "limitations": ["Country averages hide within-country differences by gender, income, age, labor-force status, and rural/urban residence.",
                        "Clusters depend on the selected indicators, survey year, missing-data pattern, scaling, and chosen k; they are exploratory summaries, not permanent country types.",
                        "Observed indicator differences are descriptive associations and do not establish causes or policy effects.",
                        "Median imputation can compress variation; excluded indicators and countries can change the profile.",
                        "Cross-country estimates may reflect survey design, coverage, and contextual differences; validate with domain expertise before policy use."],
    }
