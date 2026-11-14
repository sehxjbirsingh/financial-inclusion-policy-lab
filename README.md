# Global Financial Inclusion Policy Lab

An interactive, local web app for exploring country financial-inclusion profiles from World Bank Global Findex country-level data. It frames clustering as a tool for data-driven policymaking and global financial-inequality analysis: the profiles help identify patterns and questions for further study, not permanent labels or rankings.

## Run locally

Requires Python 3.10 or newer.

```powershell
cd financial-inclusion-policy-lab
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python app.py
```

Open http://127.0.0.1:5000. The dashboard uses Plotly and Google Fonts from CDNs, so those visual assets need internet access. Analysis and upload handling run locally in Flask.

## Data

Download the official Global Findex country-level CSV or Excel file from the [World Bank download page](https://www.worldbank.org/en/publication/globalfindex/download-data). The World Bank page currently provides indicators for 2024, 2021, 2017, 2014 and 2011. Choose the survey year represented in the uploaded file. Country-level exports are the intended input; individual respondent records are not suitable for this app's country-profile analysis.

The loader supports:

- Country-level wide files: one row per country and numeric indicator columns.
- Long files: country, indicator, year and value columns.
- World Bank-style exports: country and indicator rows with survey years in columns.

For best results, retain clear headers such as `Country Name`, `Indicator Name`, `Year`, and `Value`. Upload only a single worksheet/sheet of country-level values. Region, income-group, and world aggregate rows are filtered to avoid mixing country and aggregate observations.

## User inputs and fixed analysis rules

Users select the uploaded dataset, survey year, indicators, cluster-count range, and the configuration (`k`) used to display country profiles. Method rules are fixed in `analysis.py` so runs remain comparable:

1. Remove indicators with more than 35% missing values.
2. Fill remaining gaps with each indicator's median.
3. Standardize each indicator to zero mean and unit variance.
4. Fit K-Means with Euclidean geometry, `random_state=42`, `n_init=20`, and the Lloyd algorithm.
5. Compare each k using WCSS (Euclidean K-Means objective), silhouette under Euclidean and Manhattan distance, and Davies–Bouldin under both geometries.
6. Use two-component PCA only to visualize separation. PCA axes are not substantive policy dimensions.
7. Report repeated-seed adjusted Rand index at each tested k for initialization sensitivity. This does not measure robustness to a different sample, year, or feature set.

Classical K-Means minimizes squared Euclidean distances. Manhattan distance is therefore used as a validation sensitivity check on the fitted partition, not as an alternative K-Means objective. WCSS is not calculated for Manhattan distance.

## Reading the results responsibly

The dashboard gives country assignments, cluster average indicator profiles (with relative standardized values), feature separation shares, validation values, and PCA coordinates. Feature shares are descriptive between-cluster spread; they are not causal importance scores. Compare several metrics and the substantive plausibility of the profiles when selecting k; no single score establishes the right number of country groups.

The analysis is exploratory. Country means mask differences within countries; survey uncertainty, missingness, coverage and context can affect comparisons. The profiles can help frame policy questions, but they should not be used alone to target aid, rank countries, infer causes, or predict a country's permanent financial-inclusion status. Validate interpretations against local evidence, disaggregated indicators and domain expertise.

## Project layout

```text
app.py                 Flask routes and upload endpoints
analysis.py            Data preparation, clustering, scores and profiles
templates/index.html   Dashboard structure
static/styles.css      Responsive visual design
static/app.js          Upload interaction, charts and CSV export
requirements.txt       Python dependencies
```
