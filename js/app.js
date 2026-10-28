/**
 * =============================================================================
 * MAIN APPLICATION CONTROLLER
 * =============================================================================
 * Orchestrates LeadGate, 3D Visualizer, Photo Scrubber, Modals, Category
 * Navigation, and Viewport Telemetry HUD.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Modals & Info Overlays
  const modalsCtrl = new window.ModalsController();

  // 2. Initialize 3D Visualizer
  const visualizer = new window.Visualizer3D('canvas-3d', {
    onAngleUpdate: (x, y, zoom) => {
      const rotXEl = document.getElementById('telemetry-rot-x');
      const rotYEl = document.getElementById('telemetry-rot-y');
      const scaleEl = document.getElementById('telemetry-scale');
      if (rotXEl) rotXEl.textContent = `${x > 0 ? '+' : ''}${x}°`;
      if (rotYEl) rotYEl.textContent = `${y > 0 ? '+' : ''}${y}°`;
      if (scaleEl) scaleEl.textContent = `${zoom}x`;
    },
    onZoomUpdate: (factor) => {
      const slider = document.getElementById('viewport-zoom-slider');
      if (slider) slider.value = Math.round(factor * 100);
    }
  });

  // 3. Initialize Photo & Video Scrubber
  const scrubber = new window.PhotoScrubber('photo-scrubber-view', {
    onFrameChange: (index, total) => {
      const frameEl = document.getElementById('telemetry-frame');
      if (frameEl) frameEl.textContent = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    }
  });

  // 4. Initialize Continuous Miniature 3D & Photo Marquee on Gate
  const gateMarquee = new window.GateMarquee('gate-marquee-stage');

  // 5. Initialize Mandatory Lead Gate
  const leadGate = new window.LeadGate({
    onUnlock: (lead) => {
      console.log('360 Studio Unlocked for client:', lead);
      // Trigger a subtle welcoming camera orbit sweep
      if (visualizer) {
        visualizer.autoRotate = true;
        setTimeout(() => { visualizer.autoRotate = false; }, 2800);
      }
    }
  });

  // Expose instances to window for debugging and dev testing
  window.appInstances = { leadGate, visualizer, scrubber, modalsCtrl, gateMarquee };

  // Current Active State
  let currentCategory = 'cups';
  let currentViewMode = '3d'; // '3d' or 'photo'

  // 5. Category Navigation
  const categoryTabs = document.querySelectorAll('.category-tab');
  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const categoryId = tab.getAttribute('data-category');
      if (!categoryId || categoryId === currentCategory) return;

      categoryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      switchCategory(categoryId);
    });
  });

  function switchCategory(categoryId) {
    currentCategory = categoryId;
    const meta = window.DATA_CONFIG?.productMedia?.[categoryId];
    if (!meta) return;

    // Update Left HUD Telemetry
    const tagEl = document.getElementById('hud-category-tag');
    const titleEl = document.getElementById('hud-product-title');
    const descEl = document.getElementById('hud-product-desc');
    const specsEl = document.getElementById('hud-specs-grid');

    if (tagEl) tagEl.textContent = meta.categoryBadge;
    if (titleEl) titleEl.textContent = meta.name;
    if (descEl) descEl.textContent = meta.description;

    if (specsEl && meta.specsList) {
      specsEl.innerHTML = meta.specsList.map(s => `
        <div class="spec-row">
          <span class="spec-key">${s.label}</span>
          <span class="spec-val">${s.value}</span>
        </div>
      `).join('');
    }

    // Update Ambient Radial Light Color
    const ambientEl = document.querySelector('.ambient-light');
    if (ambientEl && meta.accentColor) {
      ambientEl.style.background = `radial-gradient(circle, ${meta.accentColor} 0%, transparent 70%)`;
    }

    // Update 3D Stage
    if (visualizer) {
      visualizer.loadProductModel(categoryId);
    }

    // Update 2D Photo Scrubber
    if (scrubber) {
      if (meta.photos && meta.photos.length > 0) {
        scrubber.setPhotos(meta.photos);
      }
    }

    // Update Modals
    if (modalsCtrl) {
      modalsCtrl.setCategory(categoryId);
    }
  }

  // 6. View Mode Switcher (3D WebGL vs Angle Photo Scrubber)
  const viewModeBtns = document.querySelectorAll('.view-mode-btn');
  const canvas3dEl = document.getElementById('canvas-3d');
  const scrubberViewEl = document.getElementById('photo-scrubber-view');

  viewModeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-view-mode');
      if (!mode || mode === currentViewMode) return;

      viewModeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentViewMode = mode;

      if (mode === '3d') {
        if (canvas3dEl) canvas3dEl.style.display = 'block';
        if (scrubberViewEl) scrubberViewEl.classList.remove('active');
      } else if (mode === 'photo') {
        if (canvas3dEl) canvas3dEl.style.display = 'none';
        if (scrubberViewEl) scrubberViewEl.classList.add('active');
        const meta = window.DATA_CONFIG?.productMedia?.[currentCategory];
        if (meta && meta.photos) {
          scrubber.setPhotos(meta.photos);
        }
      }
    });
  });

  // 7. Viewport Utility Buttons
  // Auto-Rotate
  const btnAutoRotate = document.getElementById('btn-autorotate');
  if (btnAutoRotate) {
    btnAutoRotate.addEventListener('click', () => {
      const active = visualizer.toggleAutoRotate();
      btnAutoRotate.classList.toggle('active', active);
    });
  }

  // Exploded View
  const btnExploded = document.getElementById('btn-exploded-view');
  if (btnExploded) {
    btnExploded.addEventListener('click', () => {
      const active = visualizer.toggleExplodedView();
      btnExploded.classList.toggle('active', active);
    });
  }

  // Wireframe
  const btnWireframe = document.getElementById('btn-wireframe');
  if (btnWireframe) {
    btnWireframe.addEventListener('click', () => {
      const active = visualizer.toggleWireframe();
      btnWireframe.classList.toggle('active', active);
    });
  }

  // Reset Orientation
  const btnReset = document.getElementById('btn-reset-view');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      visualizer.resetOrientation();
      if (scrubber) scrubber.setZoom(1.0);
    });
  }

  // Zoom Slider
  const zoomSlider = document.getElementById('viewport-zoom-slider');
  if (zoomSlider) {
    zoomSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10) / 100;
      visualizer.setZoomFactor(val);
      if (currentViewMode === 'photo') {
        scrubber.setZoom(0.7 + val * 1.8);
      }
    });
  }

  const btnZoomIn = document.getElementById('btn-zoom-in');
  if (btnZoomIn) {
    btnZoomIn.addEventListener('click', () => {
      visualizer.setZoomDelta(-0.4);
      if (currentViewMode === 'photo') scrubber.setZoom(scrubber.zoomScale + 0.2);
    });
  }

  const btnZoomOut = document.getElementById('btn-zoom-out');
  if (btnZoomOut) {
    btnZoomOut.addEventListener('click', () => {
      visualizer.setZoomDelta(0.4);
      if (currentViewMode === 'photo') scrubber.setZoom(scrubber.zoomScale - 0.2);
    });
  }

  // 8. Theme Switcher (Obsidian Dark vs Matte Off-White)
  const themeBtn = document.getElementById('btn-theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      themeBtn.title = `Switch to ${newTheme === 'dark' ? 'Matte Clay' : 'Obsidian'} Mode`;
      if (visualizer && visualizer.scene) {
        visualizer.scene.fog.color.setHex(newTheme === 'dark' ? 0x0A0A0C : 0xF5F5F3);
      }
    });
  }

  // 9. Initial Category Sync
  switchCategory('cups');
});
