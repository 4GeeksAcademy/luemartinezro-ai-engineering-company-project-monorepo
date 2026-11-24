"""
HealthCore Central API — Application package.

Ensures the shared packages directory is on sys.path so that
``import healthcore`` works both from the API and from scripts.
"""

import os
import sys

# Add packages/shared to the Python path so `healthcore` is importable
_PKG_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "packages", "shared")
)
if _PKG_DIR not in sys.path:
    sys.path.insert(0, _PKG_DIR)