/**
 * =============================================================================
 * CENTRALIZED B2B PRODUCT SHOWCASE & BRANDING CONFIGURATION
 * =============================================================================
 * This configuration file drives all product catalogs, media assets, pricing
 * tiers, final look preview galleries, and company information popovers.
 * Modify entries here to update the application without altering core UI code.
 */

const DATA_CONFIG = {
  // Company & Manufacturing Profile for top-right info drawer
  companyInfo: {
    brandName: "BPS INDUSTRIAL",
    tagline: "Industrial-Grade Custom Food Packaging & Sustainable Flexo Printing",
    overview: "BPS is an enterprise manufacturing partner specializing in sustainable, certified food-grade packaging. We engineer bespoke branded solutions for global QSR chains, boutique specialty roasters, cloud kitchens, and institutional hospitality operators.",
    infrastructure: [
      { label: "Printing Tech", val: "6-Color HD Flexography & 8-Color UV Heidelberg Offset" },
      { label: "Caliper Range", val: "180 GSM to 450 GSM Virgin & Recycled Kraft Boards" },
      { label: "Coatings", val: "Water-based Dispersion Bio-Barrier, PLA & PE Seal" },
      { label: "Daily Output", val: "1.2 Million Units Daily Forming Capacity" },
    ],
    certifications: [
      { code: "FDA 21 CFR 176.170", desc: "Direct food contact compliance (liquids & fatty foods)" },
      { code: "FSC® C149202", desc: "100% Certified sustainable forestry chain of custody" },
      { code: "ISO 22000 / BRCGS", desc: "Global food safety & hygiene packaging grade A" },
      { code: "EN 13432", desc: "Compostable & biodegradable dispersion coating certification" }
    ],
    moqPolicies: [
      { item: "Custom Printed Cups", moq: "5,000 units per artwork size" },
      { item: "Greaseproof Wrap Paper", moq: "10,000 cut sheets or 20 master roll spools" },
      { item: "Microwave Containers", moq: "3,000 complete sets (base + lid)" },
      { item: "Embossed Tissue Papers", moq: "10,000 napkins (2-ply or 3-ply)" }
    ],
    artworkGuidelines: [
      "Vector formats accepted: Adobe Illustrator (.AI), PDF/X-1a, or Vector EPS.",
      "All fonts converted to outlines / curves.",
      "Color profile: CMYK or Pantone Matching System (PMS Solid Coated).",
      "Bleed allowance: Minimum 3.0 mm exterior bleed with 4.0 mm safety margin.",
      "Complimentary prepress 3D digital proof generated within 24 hours of PO."
    ],
    contactInfo: {
      salesEmail: "b2b@bps-industrial.com",
      enterpriseDesk: "+1 (800) 482-BPS / +91 (22) 8800-PACK",
      plantLocation: "BPS Industrial Park, Sector 4, Precision Manufacturing Corridor",
      turnaround: "Standard production dispatch: 10–14 business days. Priority expedited: 6 business days."
    }
  },

  // 1. PRODUCT MEDIA CONFIGURATION
  productMedia: {
    cups: {
      id: "cups",
      name: "Custom-Branded Paper Cups",
      subtitle: "Aqueous Bio-Barrier & Double-Wall Heat Insulation",
      categoryBadge: "HOT & COLD BEVERAGES",
      description: "Precision-tapered paper cups engineered with virgin food-grade board, ultrasonic leak-proof bottom crimp, and calibrated rolled lips for effortless lid snaps. Available with full-bleed CMYK flexo printing.",
      dimensions: {
        rimDiameter: "90 mm",
        bottomDiameter: "60 mm",
        height: "112 mm",
        capacity: "12 oz / 350 ml (Also in 4oz, 8oz, 16oz)",
        paperWeight: "300 GSM + 18g Bio-Barrier"
      },
      specsList: [
        { label: "Lip Roll Strength", value: "3.2 kN calibrated rigidity" },
        { label: "Heat Retention", value: "Up to 98°C beverage tolerance" },
        { label: "Leak Resistance", value: "Ultrasonic 360° bottom fusion" },
        { label: "Eco-Option", value: "100% Home compostable bio-dispersion" }
      ],
      // Multi-angle reference photography sequence
      photos: [
        { url: "assets/products/cup_warli_nolid.jpg", label: "Reference Photo 01 — Custom Printed Paper Cup (Without Lid)" },
        { url: "assets/products/cup_angles_collage.jpg", label: "Reference Photo 02 — Multi-Angle Inspection Collage" },
        { url: "assets/products/cup_spot_lie_01.jpeg", label: "Reference Photo 03 — Spot The Lie (Front Logo)" },
        { url: "assets/products/cup_spot_lie_02.jpeg", label: "Reference Photo 04 — French Fries Story Panel" },
        { url: "assets/products/cup_spot_lie_03.jpeg", label: "Reference Photo 05 — Squirrels Power Grid Fact" },
        { url: "assets/products/cup_spot_lie_04.jpeg", label: "Reference Photo 06 — Emu War Trivia Panel" },
        { url: "assets/products/cup_nescafe_front.jpeg", label: "Reference Photo 07 — Commercial Flexo Print" },
        { url: "assets/products/cup_folk_side.jpeg", label: "Reference Photo 08 — Warli Art Motifs" },
        { url: "assets/products/cup_folk_bottom.jpeg", label: "Reference Photo 09 — Bottom Seal & Inscription" },
        { url: "assets/products/cup_top_rim.jpeg", label: "Reference Photo 10 — Top Rim Geometry" }
      ],
      modelType: "cup",
      accentColor: "#E09852",
      defaultAngle: { x: 0.15, y: -0.4 }
    },

    wraps: {
      id: "wraps",
      name: "Food Wrap & Deli Roll Papers",
      subtitle: "Greaseproof, Moisture-Proof & Heat-Venting Paper",
      categoryBadge: "DELI, BAKERY & QSR",
      description: "High-yield greaseproof wrapping paper designed for hot burgers, artisanal sandwiches, pastries, and fried appetizers. Resists lipid penetration without sogginess, engineered for fast line-wrapping.",
      dimensions: {
        rimDiameter: "120 mm (Roll Core)",
        bottomDiameter: "Roll Spool Width 300 mm",
        height: "Sheet: 300 x 300 mm",
        capacity: "38–45 GSM Food Cellulose",
        paperWeight: "Pure Virgin Pine Pulp"
      },
      specsList: [
        { label: "Grease Resistance", value: "Kit 7 to Kit 9 Certified" },
        { label: "Breathability", value: "High vapor porosity (no soggy crusts)" },
        { label: "Printing Tech", value: "Non-toxic food-safe water inks" },
        { label: "Format", value: "Continuous Roll or Interfolded Sheets" }
      ],
      photos: [
        { url: "assets/wrap_paper_roll.jpg", label: "Reference Photo 01 — Master Spool Roll with Repeating Stamp" },
        { url: "assets/wrap_final_mockup.jpg", label: "Reference Photo 02 — Deli Line Tartan Wrap Pattern" }
      ],
      modelType: "wrap_roll",
      accentColor: "#4FB385",
      defaultAngle: { x: 0.3, y: 0.6 }
    },

    containers: {
      id: "containers",
      name: "Microwave Food Containers",
      subtitle: "Virgin Polypropylene Base with Anti-Fog Snap Lids",
      categoryBadge: "MEAL PREP & CLOUD KITCHEN",
      description: "Injection-molded heavy-gauge food storage containers engineered for microwave reheating and freezer durability. Feature airtight perimeter rims with audible snap-lock closures and stackable footings.",
      dimensions: {
        rimDiameter: "220 x 150 mm (Top Lip)",
        bottomDiameter: "195 x 125 mm (Base)",
        height: "55 mm Depth",
        capacity: "750 ml / 26 oz (Also 500ml & 1000ml)",
        paperWeight: "Polypropylene (PP #5) + Anti-Fog Lid"
      },
      specsList: [
        { label: "Thermal Range", value: "-20°C (Freezer) to +120°C (Microwave)" },
        { label: "Lid Clarity", value: "Ultra-Clear Anti-Fog Steam Barrier" },
        { label: "Stackability", value: "Recessed interlock top channels" },
        { label: "Branding", value: "Custom Die-Cut Kraft Wrap Sleeves & IML" }
      ],
      photos: [
        { url: "assets/products/containers_prep_stack.jpg", label: "Reference Photo 01 — Triple Stack Inspection with Lids" },
        { url: "assets/containers_final_mockup.jpg", label: "Reference Photo 02 — Custom Printed Kraft Wrap Sleeve" }
      ],
      modelType: "container",
      accentColor: "#3B82F6",
      defaultAngle: { x: 0.45, y: -0.5 }
    },

    tissues: {
      id: "tissues",
      name: "Printed Tissue Papers & Napkins",
      subtitle: "2-Ply & 3-Ply Virgin Pulp with Edge Waffle Embossing",
      categoryBadge: "HOSPITALITY & TABLETOP",
      description: "Ultra-soft, high-absorbency cocktail, lunch, and dinner napkins. Features luxurious border embossing, hot-stamp metallic foil options, or crisp spot-color typography that enhances tabletop ambiance.",
      dimensions: {
        rimDiameter: "Folded: 125 x 125 mm (Cocktail)",
        bottomDiameter: "Unfolded: 250 x 250 mm",
        height: "Stack: 40 mm (50 Napkins)",
        capacity: "2-Ply (32 GSM) / 3-Ply (48 GSM)",
        paperWeight: "100% Bleached Chlorine-Free Pulp"
      },
      specsList: [
        { label: "Absorption Speed", value: "< 2.5 seconds water intake" },
        { label: "Tensile Wet Strength", value: "Reinforced fiber structure" },
        { label: "Embossing", value: "Precision border blind or foil stamp" },
        { label: "Fold Type", value: "1/4 Cocktail Fold or 1/8 Dinner Fold" }
      ],
      photos: [
        { url: "assets/tissue_papers_luxury.jpg", label: "Reference Photo 01 — The Cask & Oak Gold Foil & Kraft Stack" }
      ],
      modelType: "tissue",
      accentColor: "#F59E0B",
      defaultAngle: { x: 0.25, y: 0.4 }
    }
  },

  // 2. CENTRALIZED PRICING TIERS & EXACT PRICING DATA
  productPrices: {
    cupsWithoutLid: {
      category: "cups",
      title: "Prices for cups (without lid)",
      sections: [
        {
          heading: "-> Single wall 150ml",
          items: [
            { label: "-- 165 gsm", price: "2.5rs" },
            { label: "-- 185 gsm", price: "2.8rs" }
          ]
        },
        {
          heading: "-> Double wall 250ml",
          items: [
            { label: "-- 225 gsm", price: "3.3rs" }
          ]
        }
      ]
    },

    cupsWithLid: {
      category: "cups",
      title: "Prices for the cup with lid",
      statusNotice: "will be updated shortly, currently not providing prices"
    },

    rollPaper: {
      category: "wraps",
      title: "Prices for roll paper -",
      items: [
        { label: "1) 13×13 inches", price: ":- 3.8" },
        { label: "2) 13×15 inches", price: ":- 4.0" },
        { label: "3) 12×12 inches", price: ":- 3.8" },
        { label: "4) 12×15 inches", price: ":- 4.0" }
      ],
      footerNote: "Rs per sheet"
    },

    containers: {
      category: "containers",
      title: "Prices for containers",
      statusNotice: "will be updated shortly, currently not providing prices"
    },

    tissues: {
      category: "tissues",
      title: "Prices for tissue paper",
      statusNotice: "will be updated shortly, currently not providing prices"
    }
  },

  // 3. FINAL LOOK IMAGES (How Will Your Product Look)
  finalLookImages: {
    cups: {
      title: "Commercial Coffee Cup Lineup",
      brandName: "ARCHITECT COFFEE CO.",
      clientType: "Specialty Roaster & Artisan Bakery",
      mainMockup: "assets/cups_final_mockup.jpg",
      comparisonBefore: "assets/products/cup_spot_lie_01.jpeg",
      comparisonAfter: "assets/cups_final_mockup.jpg",
      finishSpecs: [
        "Matte Soft-Touch Non-Slip Paper Finish",
        "Dual-Toned Obsidian Black & Warm Desert Sand",
        "Monochrome Calibrated Typography with Geometric Accents",
        "Aqueous Biodegradable Dispersion Liner"
      ],
      gallery: [
        { url: "assets/cups_final_mockup.jpg", caption: "Architect Coffee 8oz, 12oz, 16oz Triad Composition" },
        { url: "assets/products/cup_nescafe_front.jpeg", caption: "High-Saturation Flexo Brand Printing" },
        { url: "assets/products/cup_folk_side.jpeg", caption: "Fine-Line Graphic Folk Motifs & Edge Precision" }
      ]
    },

    wraps: {
      title: "Custom Printed Deli & Sandwich Paper",
      brandName: "HEIRLOOM PROVISIONS",
      clientType: "Artisanal Delicatessen & Burger Chain",
      mainMockup: "assets/wrap_final_mockup.jpg",
      comparisonBefore: "assets/wrap_paper_roll.jpg",
      comparisonAfter: "assets/wrap_final_mockup.jpg",
      finishSpecs: [
        "Kit 8 Grease-Barrier Bleached Virgin Paper",
        "Classic Navy Geometric Grid Plaid Repeat Pattern",
        "Diagonal Diamond Logo Center-Lock for Burger Folding",
        "Zero Chemical Odor Transfer Under 95°C Heat"
      ],
      gallery: [
        { url: "assets/wrap_final_mockup.jpg", caption: "Gourmet Cheeseburger & Deli Roll Presentation" },
        { url: "assets/wrap_paper_roll.jpg", caption: "Continuous Master Spool with Repeating Artisan Badges" }
      ]
    },

    containers: {
      title: "Eco Meal Prep Box with Custom Sleeve",
      brandName: "TERRA KITCHEN GOURMET",
      clientType: "Health & Organic Delivery Chain",
      mainMockup: "assets/containers_final_mockup.jpg",
      comparisonBefore: "assets/products/containers_prep_stack.jpg",
      comparisonAfter: "assets/containers_final_mockup.jpg",
      finishSpecs: [
        "Unbleached Kraft 350 GSM Heavy Board Sleeve",
        "Airtight Leak-Proof Perimeter Snap Rim",
        "Anti-Fog High Transparency Steam Venting Lid",
        "Microwave Safe to 120°C & Freezer Ready"
      ],
      gallery: [
        { url: "assets/containers_final_mockup.jpg", caption: "Terra Kitchen Nourish Bowl Sleeve & Meal Pairing" },
        { url: "assets/products/containers_prep_stack.jpg", caption: "Rigid Industrial Triple Stack Production Batch" }
      ]
    },

    tissues: {
      title: "Luxury Cocktail Napkins & Table Tissues",
      brandName: "THE CASK & OAK",
      clientType: "Speakeasy Bar & High-End Steakhouse",
      mainMockup: "assets/tissue_papers_luxury.jpg",
      comparisonBefore: "assets/tissue_papers_luxury.jpg",
      comparisonAfter: "assets/tissue_papers_luxury.jpg",
      finishSpecs: [
        "Deep Obsidian Black & Natural Organic Kraft 2-Ply",
        "Brilliant Metallic Copper & Gold Hot Foil Stamping",
        "Waffle-Embossed Frame Border for Edge Stiffness",
        "Ultra-Absorbent 36 GSM Virgin Fiber Matrix"
      ],
      gallery: [
        { url: "assets/tissue_papers_luxury.jpg", caption: "Gold Foil & Copper Stamped Cocktail Napkins" }
      ]
    }
  }
};

// Export configuration to global window object
window.DATA_CONFIG = DATA_CONFIG;
