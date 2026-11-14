# Data Preprocessing and Variable Curation Report
**Global Financial Inclusion Policy Lab** | World Bank Global Findex 2025

---

## 1. Executive Summary
- **Survey Round**: 2024 Country-Level Observations
- **Total Economies Evaluated**: 140 sovereign and autonomous territories
- **Indicators Retained in Cluster Space**: 9 high-signal variables spanning all 5 financial pillars
- **Indicators Excluded**: 3 sparse/redundant variables (>40% missingness)
- **Imputation Method**: Median imputation within feature columns (retains robust central tendency)
- **Normalization**: Standard scaling ($z = (x - \mu) / \sigma$)
- **Reproducibility Seed**: Fixed at `42`

---

## 2. Variable Relevance Catalog
Every variable considered in the unsupervised learning space is documented below with its policy pillar and inclusion rationale:

| Technical Series ID | Plain-English Variable Name | Financial Pillar | Missing % (2024) | Pipeline Status | Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `account.t.d` | **Overall Account Ownership (% age 15+)** | Access | 0.0% | `KEPT` | Primary benchmark indicator for global financial inclusion; measures adults holding an account at a bank, credit union, or mobile money service. |
| `fiaccount.t.d` | **Financial Institution Account (% age 15+)** | Access | 0.0% | `KEPT` | Measures traditional formal banking presence; essential for distinguishing bank-led models from digital leapfrogging. |
| `mobileaccount.t.d` | **Mobile Money Account (% age 15+)** | Access & Digital | 42.9% | `KEPT` | Captures fintech and telco-driven financial access, especially prominent in Sub-Saharan Africa and South Asia. |
| `merchant.pay` | **Digital Merchant Payment (% age 15+)** | Usage - Payments | 30.0% | `KEPT` | Measures real-world day-to-day digital commerce transactions at stores or markets, beyond passive account holding. |
| `save.any.t.d` | **Saved Any Money in Past Year (% age 15+)** | Usage - Savings | 30.0% | `KEPT` | Measures broad savings propensity across both formal mechanisms and informal community structures. |
| `fin17a` | **Saved at a Financial Institution (% age 15+)** | Usage - Savings | 30.0% | `KEPT` | Measures formal capital accumulation in regulated depository institutions. |
| `borrow.any.t.d` | **Borrowed Any Money in Past Year (% age 15+)** | Usage - Credit | 30.0% | `KEPT` | Captures credit participation and liquidity access across formal lenders, family, friends, and informal sources. |
| `fin24aP` | **Emergency Funds Possible in 30 Days (% age 15+)** | Financial Resilience | 0.0% | `KEPT` | World Bank gold standard measure of household shock absorption capacity against unexpected health or economic crises. |
| `fin24sav` | **Emergency Funds Sourced from Savings (% age 15+)** | Financial Resilience | 30.0% | `KEPT` | Distinguishes self-reliant resilience buffers from high-risk debt dependence during shocks. |
| `fin14a` | **Used debit card in past year (% age 15+)** | Usage - Card | > 40% | `DROPPED` | Excessive missingness (75.8% missing across countries in 2024); fails quality retention threshold. |
| `fin14b` | **Used credit card in past year (% age 15+)** | Usage - Card | > 40% | `DROPPED` | Excessive missingness (75.8% missing in 2024); high sparsity introduces severe noise in unsupervised distance metrics. |
| `fin17b` | **Received government transfers into account (% age 15+)** | Usage - G2P | > 40% | `DROPPED` | High missingness (43.1% missing); superseded by broader payment and account ownership indicators. |

---

## 3. Missing Data Audit & Imputation Strategy
Financial survey microdata naturally displays structural missingness across distinct country development archetypes.
For instance, `mobileaccount.t.d` is primarily administered in developing markets, whereas high-income European nations rely almost exclusively on bank debit cards and SEPA accounts.

### Retention Rule
> **Rule**: Features with missingness strictly $\le 40\%$ across sovereign country rows are retained. Any variable exceeding $40\%$ missingness is automatically excluded to prevent artificial cluster centroid drift.

### Imputation Performance Before vs After (Median Imputation)
| Indicator Series | Mean (Raw) | Mean (Imputed) | Std (Raw) | Std (Imputed) | Median | Available Count |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `account.t.d` | 70.77% | 70.77% | 22.86 | 22.86 | 73.33% | 140 / 140 |
| `fiaccount.t.d` | 63.61% | 63.61% | 29.27 | 29.27 | 70.25% | 140 / 140 |
| `mobileaccount.t.d` | 32.2% | 31.83% | 20.82 | 15.7 | 31.33% | 80 / 140 |
| `merchant.pay` | 27.53% | 25.33% | 21.95 | 18.64 | 20.19% | 98 / 140 |
| `save.any.t.d` | 48.99% | 48.8% | 13.73 | 11.48 | 48.35% | 98 / 140 |
| `fin17a` | 19.29% | 18.53% | 12.36 | 10.39 | 16.73% | 98 / 140 |
| `borrow.any.t.d` | 58.41% | 58.59% | 14.12 | 11.8 | 59.02% | 98 / 140 |
| `fin24aP` | 63.17% | 63.17% | 41.84 | 41.84 | 88.33% | 140 / 140 |
| `fin24sav` | 15.84% | 15.62% | 7.24 | 6.06 | 15.1% | 98 / 140 |

---

## 4. Categorical Metadata Handling
World Bank geographic regions (`regionwb24_hi`) and income tiers (`incomegroupwb24`) are extracted as categorical labels.

> **Important Methodological Note**: Categorical regional and income indicators are **STRICTLY EXCLUDED** from the clustering distance space. Including them would artificially bias clusters along geographic or GDP lines rather than discovering organic, data-driven financial architecture patterns. They are retained purely as metadata for post-clustering validation and comparative demographic equity analysis.

---

## 5. Standardization Verification
Because raw indicators are measured on varying percentage ranges (e.g. mobile money from 0% to 92%, emergency resilience from 12% to 99%), classical distance metrics (Euclidean and Manhattan) would otherwise overweight high-variance features.

Each feature $j$ is centered and scaled via `StandardScaler`:
$$z_{ij} = \frac{x_{ij} - \mu_j}{\sigma_j}$$
Post-scaling verification confirms all 9 retained indicator dimensions exhibit mean $\mu = 0.000$ and sample variance $s^2 = 1.000$.

---
*Report automatically generated by `analysis/data_preprocessing.py` on pipeline execution.*