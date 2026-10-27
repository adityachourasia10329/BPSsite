# BPS — B2B Product Showcase & Real-Time 360° Visualizer Studio

Clean, grounded futuristic B2B product showcase and custom branding visualizer for packaging and printing enterprises (specializing in custom-branded cups, food wrap/roll papers, containers, and printed tissue papers).

---

## ⚡ Core Highlights

* **Mandatory Lead-Capture Gate:**
  * Zero-bypass qualification modal over blurred workspace preview.
  * Captures: Full Name, Business Type, Corporate Email, Phone/WhatsApp, Custom Requirements, and Attribution Channel.
  * Stores session in `localStorage` and prepares structured payload for CRM/webhook ingestion.
* **Grounded Futuristic Aesthetic:**
  * Industrial-minimalist aesthetic inspired by Teenage Engineering, Apple VisionOS, and Linear.
  * Obsidian dark mode default with instant toggle to industrial matte clay / off-white.
  * Real-time typography and engineering telemetry HUD overlays.
* **Interactive 360° Stage (Three.js WebGL & Photo Scrubber):**
  * Omnidirectional real-time rotation & tilt following cursor vector with inertia damping.
  * Multi-touch pinch-to-zoom, mouse scroll zoom, and precision on-screen slider.
  * 4 Industrial Categories:
    1. **Cups:** Single & double-wall hot cups with rolled rim, bottom seal, and CMYK branding wrap.
    2. **Paper for Wraps & Rolls:** Master roll spool with unrolled branded deli sheet flap.
    3. **Containers:** Microwaveable meal prep boxes with anti-fog snap lid and branded kraft sleeve.
    4. **Printed Tissue Papers:** Stack of embossed 3-ply napkins with gold foil stamp.
  * Exploded mechanical view mode, auto-rotation orbit, and structural wireframe inspect.
* **Dual Action Controls:**
  * **Price & Tiers:** Tiered wholesale rates (5k to 100k units) + Interactive Order Volume Estimator calculator.
  * **How Will Your Product Look:** High-resolution final branded mockups and applied print specifications.
* **Top-Right Information Drawer:**
  * Popover detailing company profile, plant infrastructure, MOQ policies, certifications (FDA, FSC, ISO, BRCGS), and prepress guidelines.

---

## 🚀 Quick Start

1. Clone or open the repository folder.
2. Open `index.html` directly in any modern web browser (Edge, Chrome, Firefox, Safari):
   ```bash
   # On Windows
   Start-Process index.html
   ```
3. Complete the lead-capture gate to unlock the full 360° product studio.

---

## 📁 Repository Structure

```
BPS/
├── index.html                     # Primary HTML5 application entry point
├── .gitignore                     # Git ignore rules
├── README.md                      # Project documentation
├── css/
│   └── style.css                  # Grounded futuristic design system & layout
├── js/
│   ├── config.js                  # Centralized media, pricing, and company configuration
│   ├── leadGate.js                # Lead gate modal validation & unlock lifecycle
│   ├── visualizer3d.js            # Three.js 3D engine with inertia & category meshes
│   ├── photoScrubber.js           # Multi-angle photo sequence and video scrubber
│   ├── modals.js                  # Price calculator, final look gallery & info drawer
│   ├── app.js                     # Main application orchestrator
│   └── vendor/
│       └── three.min.js           # Bundled Three.js library for offline reliability
└── assets/
    ├── cups_final_mockup.jpg      # Final branded cups showcase
    ├── wrap_final_mockup.jpg      # Final branded deli wraps showcase
    ├── containers_final_mockup.jpg# Final branded containers showcase
    ├── tissue_papers_luxury.jpg   # Final branded tissue papers showcase
    ├── wrap_paper_roll.jpg        # Master spool wrap roll photo
    └── products/                  # Standardized multi-angle product photography
```
