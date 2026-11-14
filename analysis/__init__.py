# Analysis package init
# Re-export legacy upload analysis helpers and new pipelines
import sys
from pathlib import Path

# Legacy module in root directory
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

# Import from legacy analysis.py if exists
try:
    import importlib.util
    legacy_path = root_dir / "analysis.py"
    if legacy_path.exists():
        spec = importlib.util.spec_from_file_location("analysis_legacy", str(legacy_path))
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        analyze_upload = mod.analyze_upload
        inspect_upload = mod.inspect_upload
        AnalysisError = mod.AnalysisError
except Exception as e:
    class AnalysisError(ValueError): pass
    def analyze_upload(*args, **kwargs): return {}
    def inspect_upload(*args, **kwargs): return {}
