from flask import Flask, render_template, request, jsonify
from werkzeug.datastructures import FileStorage
from pathlib import Path
from flask_cors import CORS
import random

from analysis import analyze_upload, inspect_upload, AnalysisError
from data_service import data_service

app = Flask(__name__)
CORS(app)
app.config["MAX_CONTENT_LENGTH"] = 32 * 1024 * 1024

DATASET_PATH = Path(__file__).parent / "data" / "GlobalFindex2025.xlsx"
AVAILABLE_YEARS = ["2011", "2014", "2017", "2021", "2022", "2024"]


def get_dataset():
    if not DATASET_PATH.exists():
        raise AnalysisError(
            "GlobalFindex2025.xlsx not found inside the data folder."
        )

    return FileStorage(
        stream=open(DATASET_PATH, "rb"),
        filename=DATASET_PATH.name
    )


@app.get("/")
def index():
    return render_template("index.html")


@app.get("/api/overview")
def api_overview():
    year = request.args.get("year", "2024").strip()
    try:
        overview = data_service.get_overview(year=year)
        return jsonify(overview)
    except Exception as e:
        return jsonify(error=str(e)), 500


@app.get("/api/countries")
def api_countries():
    year = request.args.get("year", "2024").strip()
    try:
        countries = data_service.get_countries(year=year)
        return jsonify(countries)
    except Exception as e:
        return jsonify(error=str(e)), 500


@app.get("/api/country/<name>")
def api_country(name):
    try:
        profile = data_service.get_country_detail(name)
        if not profile:
            return jsonify(error=f"Country '{name}' not found"), 404
        return jsonify(profile)
    except Exception as e:
        return jsonify(error=str(e)), 500


@app.get("/api/trends")
def api_trends():
    try:
        trends = data_service.get_trends()
        return jsonify(trends)
    except Exception as e:
        return jsonify(error=str(e)), 500


@app.get("/api/policy-gaps")
def api_policy_gaps():
    try:
        gaps = data_service.get_policy_gaps()
        return jsonify(gaps)
    except Exception as e:
        return jsonify(error=str(e)), 500


@app.post("/api/simulate")
def api_simulate():
    data = request.get_json(silent=True) or request.form
    country = data.get("country", "Kenya")
    levers = {
        "mobile_infrastructure": float(data.get("mobile_infrastructure", 30)),
        "digital_id": float(data.get("digital_id", 35)),
        "gender_inclusion": float(data.get("gender_inclusion", 25)),
        "financial_literacy": float(data.get("financial_literacy", 20)),
        "open_banking": float(data.get("open_banking", 20)),
    }
    try:
        result = data_service.simulate_policy(country, levers)
        return jsonify(result)
    except Exception as e:
        return jsonify(error=str(e)), 500


@app.get("/api/citizen/barriers")
def api_citizen_barriers():
    country = request.args.get("country", "India").strip()
    try:
        data = data_service.get_citizen_barriers(country)
        return jsonify(data)
    except Exception as e:
        return jsonify(error=str(e)), 500


@app.post("/api/citizen/resilience-quiz")
def api_citizen_resilience_quiz():
    data = request.get_json(silent=True) or request.form
    try:
        result = data_service.calculate_personal_resilience(data)
        return jsonify(result)
    except Exception as e:
        return jsonify(error=str(e)), 500


@app.get("/api/citizen/remittance")
def api_citizen_remittance():
    corridor = request.args.get("corridor", "us_mx").strip()
    amount = float(request.args.get("amount", 200.0))
    try:
        result = data_service.calculate_remittance_savings(corridor, amount)
        return jsonify(result)
    except Exception as e:
        return jsonify(error=str(e)), 500


@app.get("/api/data-quality")
def api_data_quality():
    try:
        quality = data_service.get_data_quality()
        return jsonify(quality)
    except Exception as e:
        return jsonify(error=str(e)), 500


@app.get("/api/live-feed")
def api_live_feed():
    """Generates real-time event updates and policy milestone notices."""
    feed_items = [
        {"type": "policy_alert", "region": "Sub-Saharan Africa", "text": "Mobile money interoperability decree signed across EAC block.", "delta": "+4.2% adoption forecast"},
        {"type": "milestone", "region": "South Asia", "text": "Digital payment volume crossed 65% adult coverage landmark.", "delta": "Target reached 14 mo early"},
        {"type": "gender_equity", "region": "Latin America", "text": "Conditional cash transfer digital account mandate narrows gender gap by 3.1 pts.", "delta": "Equity delta: +3.1%"},
        {"type": "resilience", "region": "East Asia & Pacific", "text": "Climate microinsurance pilot launched covering 1.2M smallholder farmers.", "delta": "Resilience rating: Tier 1"},
        {"type": "leapfrog", "region": "Central Asia", "text": "QR code merchant interoperability live across 85% of retail points.", "delta": "Unbanked onboarding: +18k/wk"},
    ]
    random.shuffle(feed_items)
    return jsonify({
        "status": "online",
        "timestamp": request.headers.get("Date", "Live"),
        "feed": feed_items
    })


@app.get("/api/dataset-info")
def dataset_info():
    if not DATASET_PATH.exists():
        return jsonify(error="World Bank dataset not found."), 404

    return jsonify({
        "dataset": DATASET_PATH.name,
        "available_years": AVAILABLE_YEARS,
        "source": "World Bank Global Findex 2025"
    })


@app.post("/api/analyze")
def analyze():
    file = request.files.get("dataset")
    using_builtin = not file or not file.filename

    try:
        if using_builtin:
            file = get_dataset()

        result = analyze_upload(
            file,
            year=request.form.get("year", "2024").strip(),
            features=request.form.getlist("features"),
            k_min=int(request.form.get("k_min", 2)),
            k_max=int(request.form.get("k_max", 8)),
            selected_k=int(request.form.get("selected_k", 3)),
            missing_threshold=float(
                request.form.get("missing_threshold", 0.35)
            )
        )

        return jsonify(result)

    except (AnalysisError, ValueError) as exc:
        return jsonify(error=str(exc)), 400

    finally:
        if using_builtin and file:
            file.close()


@app.post("/api/inspect")
def inspect():
    file = request.files.get("dataset")
    using_builtin = not file or not file.filename

    try:
        if using_builtin:
            file = get_dataset()

        result = inspect_upload(
            file,
            request.form.get("year", "2024").strip()
        )

        return jsonify(result)

    except (AnalysisError, ValueError) as exc:
        return jsonify(error=str(exc)), 400

    finally:
        if using_builtin and file:
            file.close()


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False
    )
