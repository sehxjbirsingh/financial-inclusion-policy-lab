# Global Financial Inclusion Policy Lab (v2.5)
### Real-Time Policy Intelligence Platform & Econometric Simulation Suite

An interactive, high-performance web platform for real-time exploratory analysis, econometric policy simulation, and unsupervised country clustering powered by the official **World Bank Global Findex 2025** microdata aggregations (153 countries, 5 survey waves from 2011 to 2024, 466 indicators).

---

## 🌟 What's New in the Redesign

### 1. Real-Time Working Engine
- **Instant Pre-loaded Data**: Zero setup required. The application automatically indexes and caches the built-in World Bank Global Findex dataset on startup, returning instant responses (< 5ms) without requiring manual CSV uploads.
- **Live Policy Simulator**: An interactive econometric sandbox where policymakers can adjust 5 structural policy levers (Mobile Money Deregulation, Digital ID & Tiered e-KYC, Gender Parity Mandates, Financial Literacy, and Open Banking / Interoperable QR Switches) and immediately view real-time projected inclusion gains, poverty resilience, and years to universal 85% access.
- **Live Alert Ticker**: Dynamic real-time policy event feed and milestone tracking.
- **Light & Dark Mode**: Modern glassmorphic theme switcher with full persistent storage.

### 2. Multi-Page Dashboards Suite (8 Integrated Labs)
1. 🌍 **Global Overview Dashboard**: Macro KPIs (Global Account Ownership, Mobile Money Penetration, Resilience, Savings), regional breakdown charts, income tier stratification, and top/bottom performer leaderboards.
2. 🗺️ **Country Intelligence Lab**: Deep dive into any of the 153 economies with historical trajectories (2011–2024), demographic equity audits (Gender gap: Men vs Women, Wealth divide: Richest 60% vs Poorest 40%), and regional peer benchmarks.
3. 🌐 **Global Country Matrix & Explorer**: Multidimensional searchable and sortable database, live column filters, quartile color-coding, interactive Mobile Money vs Banking scatter explorer, and one-click CSV export.
4. ⚡ **Policy Simulator & Scenario Forecaster**: Dynamic simulation model with diminishing-marginal-returns calibration based on empirical World Bank policy literature.
5. 🔬 **Cluster Archetypes & Machine Learning Lab**: Unsupervised K-Means clustering, 2D PCA dimensional projection, WCSS elbow curve, Silhouette validation, profile deviation cards, and CSV export.
6. 📈 **Longitudinal Trends & Leapfrogging**: Multi-wave analysis tracking the explosion of mobile money, formal vs informal savings, and debt dynamics from 2011 to 2024.
7. 🎯 **Equity & Policy Frontiers**: Identifies the Leapfrog Vanguard (where mobile money overtakes banks), Pent-up Informal Savers, and the 20 most vulnerable economies on the Global Exclusion Frontier.
8. 📋 **Data Quality & Governance**: Microdata audit, indicator missingness rates, country observation counts per survey wave, and responsible policy guidelines.

---

## 🚀 Quickstart & Local Setup

Requires Python 3.10+ (tested on Python 3.13):

```powershell
# Navigate to directory
cd financial-inclusion-policy-lab

# Activate existing virtual environment
.\.venv\Scripts\Activate.ps1

# Install requirements (if updating)
pip install -r requirements.txt

# Launch real-time policy lab
python app.py
```

Open your browser to: **`http://127.0.0.1:5000`**

---

## 📡 RESTful API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/` | `GET` | Main Single Page Application (SPA) interface |
| `/api/overview?year=2024` | `GET` | Macro KPIs, regional aggregates, top/bottom performers |
| `/api/countries?year=2024` | `GET` | Complete country database with core indicators |
| `/api/country/<name>` | `GET` | Deep-dive profile, multi-wave history, demographic gaps |
| `/api/trends` | `GET` | Multi-wave global averages (2011, 2014, 2017, 2021, 2024) |
| `/api/policy-gaps` | `GET` | Leapfroggers, exclusion frontier, and informal savers |
| `/api/simulate` | `POST` | Real-time policy lever impact projection |
| `/api/data-quality` | `GET` | Dataset completeness audit and survey coverage |
| `/api/live-feed` | `GET` | Dynamic policy alert ticker feed |
| `/api/inspect` | `POST` | Inspect uploaded or built-in dataset features |
| `/api/analyze` | `POST` | Run multivariate K-Means clustering & PCA |

---

## 🏗️ Project Architecture

```text
financial-inclusion-policy-lab/
├── app.py                 # RESTful Flask backend and routing
├── data_service.py        # Real-time caching, indexing & simulation engine
├── analysis.py            # K-Means clustering, PCA, and validation metrics
├── data/
│   ├── GlobalFindex2025.xlsx  # Official World Bank microdata aggregations
│   └── cache/                 # Fast binary pickle caches (< 5ms response time)
├── templates/
│   └── index.html         # Modern SPA layout with 8 dashboards & sidebar
├── static/
│   ├── styles.css         # Modern glassmorphism design system & light/dark modes
│   └── app.js             # Reactive router, real-time charts & simulation controller
└── requirements.txt       # Dependencies (Flask, Flask-CORS, Pandas, Scikit-learn, etc.)
```

---

## ⚖️ Methodological Notes & Responsible Use

All predictive simulation scores and unsupervised clusters represent exploratory decision-support models for framing research and policy questions. They identify descriptive statistical associations and peer patterns, not definitive causal claims. Interpretations should always be validated alongside local qualitative evidence and contextual domain expertise.
