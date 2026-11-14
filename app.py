from flask import Flask, render_template, request, jsonify
from analysis import analyze_upload, inspect_upload, AnalysisError

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 32 * 1024 * 1024


@app.get("/")
def index():
    return render_template("index.html")


@app.post("/api/analyze")
def analyze():
    file = request.files.get("dataset")
    if not file or not file.filename:
        return jsonify(error="Choose a CSV or Excel country-level dataset."), 400
    try:
        result = analyze_upload(
            file,
            year=request.form.get("year", "").strip(),
            features=request.form.getlist("features"),
            k_min=int(request.form.get("k_min", 2)),
            k_max=int(request.form.get("k_max", 8)),
            selected_k=int(request.form.get("selected_k", 3)),
            missing_threshold=float(request.form.get("missing_threshold", 0.35)),
        )
        return jsonify(result)
    except (AnalysisError, ValueError) as exc:
        return jsonify(error=str(exc)), 400


@app.post("/api/inspect")
def inspect():
    file = request.files.get("dataset")
    if not file or not file.filename:
        return jsonify(error="Choose a CSV or Excel file."), 400
    try:
        return jsonify(inspect_upload(file, request.form.get("year", "2021")))
    except AnalysisError as exc:
        return jsonify(error=str(exc)), 400


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
