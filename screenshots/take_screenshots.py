#!/usr/bin/env python3
"""Take the 3 required PR screenshots using Playwright."""

import json
import os
from playwright.sync_api import sync_playwright

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE = "http://localhost:3000"

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 900})

        # ── 1. Form with visible validation error ──
        print("📸 1. Form with validation error...")
        page.goto(f"{BASE}/incidents/new", wait_until="networkidle")
        # Click submit with empty form to trigger validation
        page.click('button[type="submit"]')
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "01-form-validation-error.png"), full_page=True)
        print("   ✅ Saved: 01-form-validation-error.png")

        # ── 2. Incident list panel with data loaded ──
        print("📸 2. Incident list with data...")
        page.goto(f"{BASE}/incidents", wait_until="networkidle")
        page.wait_for_timeout(2000)  # Let data load
        page.screenshot(path=os.path.join(OUTPUT_DIR, "02-incident-list.png"), full_page=True)
        print("   ✅ Saved: 02-incident-list.png")

        # ── 3. Summary panel with metrics ──
        print("📸 3. Summary panel with metrics...")
        # Scroll to show summary panel at the top
        page.evaluate("window.scrollTo(0, 0)")
        page.wait_for_timeout(500)
        # Take a clip of just the summary section
        summary_el = page.query_selector('section:has(h2:text("Summary"))')
        if summary_el:
            summary_el.screenshot(path=os.path.join(OUTPUT_DIR, "03-summary-panel.png"))
        else:
            # Fallback: full page screenshot
            page.screenshot(path=os.path.join(OUTPUT_DIR, "03-summary-panel.png"), full_page=True)
        print("   ✅ Saved: 03-summary-panel.png")

        browser.close()
    print("\n✅ All screenshots saved to screenshots/")

if __name__ == "__main__":
    main()