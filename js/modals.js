/**
 * =============================================================================
 * MODALS & OVERLAYS CONTROLLER
 * =============================================================================
 * Handles:
 * 1. Top-Right Information Drawer (popover)
 * 2. Structured Pricing Modal & Interactive Volume Estimator
 * 3. Final Product Look Modal & Before/After Comparison Gallery
 */

class ModalsController {
  constructor() {
    this.currentCategory = 'cups';

    // DOM Elements
    this.infoDrawer = document.getElementById('info-drawer');
    this.infoBtn = document.getElementById('btn-info-drawer');
    this.infoCloseBtn = document.getElementById('btn-close-info');

    this.priceModal = document.getElementById('price-modal');
    this.btnPrice = document.getElementById('btn-action-price');
    this.btnClosePrice = document.getElementById('btn-close-price');

    this.finalLookModal = document.getElementById('final-look-modal');
    this.btnFinalLook = document.getElementById('btn-action-final-look');
    this.btnCloseFinalLook = document.getElementById('btn-close-final-look');

    this.init();
  }

  init() {
    this.bindInfoDrawer();
    this.bindPriceModal();
    this.bindFinalLookModal();
    this.renderCompanyInfo();
  }

  setCategory(categoryId) {
    this.currentCategory = categoryId;
    this.renderPriceData();
    this.renderFinalLookData();
  }

  /* --------------------------------------------------------------------------
     1. TOP-RIGHT INFORMATION DRAWER
     -------------------------------------------------------------------------- */
  bindInfoDrawer() {
    if (this.infoBtn && this.infoDrawer) {
      this.infoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = this.infoDrawer.classList.contains('open');
        if (isOpen) {
          this.closeInfoDrawer();
        } else {
          this.openInfoDrawer();
        }
      });
    }

    if (this.infoCloseBtn) {
      this.infoCloseBtn.addEventListener('click', () => this.closeInfoDrawer());
    }

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (this.infoDrawer && this.infoDrawer.classList.contains('open')) {
        if (!this.infoDrawer.contains(e.target) && e.target !== this.infoBtn && !this.infoBtn.contains(e.target)) {
          this.closeInfoDrawer();
        }
      }
    });
  }

  openInfoDrawer() {
    if (!this.infoDrawer) return;
    this.infoDrawer.classList.add('open');
    if (this.infoBtn) this.infoBtn.classList.add('active');
  }

  closeInfoDrawer() {
    if (!this.infoDrawer) return;
    this.infoDrawer.classList.remove('open');
    if (this.infoBtn) this.infoBtn.classList.remove('active');
  }

  renderCompanyInfo() {
    const info = window.DATA_CONFIG?.companyInfo;
    if (!info) return;

    const brandEl = document.getElementById('drawer-brand-name');
    const taglineEl = document.getElementById('drawer-tagline');
    const overviewEl = document.getElementById('drawer-overview');
    const infraContainer = document.getElementById('drawer-infra-list');
    const moqContainer = document.getElementById('drawer-moq-list');
    const certContainer = document.getElementById('drawer-cert-list');
    const prepressContainer = document.getElementById('drawer-prepress-list');
    const contactContainer = document.getElementById('drawer-contact-info');

    if (brandEl) brandEl.textContent = info.brandName;
    if (taglineEl) taglineEl.textContent = info.tagline;
    if (overviewEl) overviewEl.textContent = info.overview;

    if (infraContainer && info.infrastructure) {
      infraContainer.innerHTML = info.infrastructure.map(item => `
        <div class="spec-row">
          <span class="spec-key">${item.label}</span>
          <span class="spec-val">${item.val}</span>
        </div>
      `).join('');
    }

    if (moqContainer && info.moqPolicies) {
      moqContainer.innerHTML = info.moqPolicies.map(item => `
        <tr>
          <td>${item.item}</td>
          <td>${item.moq}</td>
        </tr>
      `).join('');
    }

    if (certContainer && info.certifications) {
      certContainer.innerHTML = info.certifications.map(item => `
        <div class="spec-bullet">
          <svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" fill="none"/></svg>
          <div>
            <strong style="color: var(--text-primary);">${item.code}:</strong> ${item.desc}
          </div>
        </div>
      `).join('');
    }

    if (prepressContainer && info.artworkGuidelines) {
      prepressContainer.innerHTML = info.artworkGuidelines.map(g => `<li>${g}</li>`).join('');
    }

    if (contactContainer && info.contactInfo) {
      contactContainer.innerHTML = `
        <div class="spec-row"><span class="spec-key">Direct Sales</span><span class="spec-val">${info.contactInfo.salesEmail}</span></div>
        <div class="spec-row"><span class="spec-key">B2B Hotline</span><span class="spec-val">${info.contactInfo.enterpriseDesk}</span></div>
        <div class="spec-row"><span class="spec-key">Dispatch Time</span><span class="spec-val">${info.contactInfo.turnaround}</span></div>
      `;
    }
  }

  /* --------------------------------------------------------------------------
     2. STRUCTURED PRICING MODAL & INTERACTIVE ESTIMATOR
     -------------------------------------------------------------------------- */
  bindPriceModal() {
    if (this.btnPrice) {
      this.btnPrice.addEventListener('click', () => this.openPriceModal());
    }
    if (this.btnClosePrice) {
      this.btnClosePrice.addEventListener('click', () => this.closePriceModal());
    }
    if (this.priceModal) {
      this.priceModal.addEventListener('click', (e) => {
        if (e.target === this.priceModal) this.closePriceModal();
      });
    }

    // Volume Calc Slider
    const slider = document.getElementById('pricing-volume-slider');
    if (slider) {
      slider.addEventListener('input', (e) => this.handleVolumeChange(parseInt(e.target.value, 10)));
    }
  }

  openPriceModal() {
    this.renderPriceData();
    if (this.priceModal) this.priceModal.classList.add('open');
  }

  closePriceModal() {
    if (this.priceModal) this.priceModal.classList.remove('open');
  }

  renderPriceData() {
    const priceData = window.DATA_CONFIG?.productPrices?.[this.currentCategory];
    const productMeta = window.DATA_CONFIG?.productMedia?.[this.currentCategory];
    if (!priceData) return;

    const titleEl = document.getElementById('price-modal-title');
    const leadTimeEl = document.getElementById('price-lead-time');
    const setupFeeEl = document.getElementById('price-setup-fee');
    const tableBody = document.getElementById('pricing-table-body');

    if (titleEl && productMeta) {
      titleEl.textContent = `Wholesale Pricing Structure: ${productMeta.name}`;
    }
    if (leadTimeEl) leadTimeEl.textContent = priceData.leadTime;
    if (setupFeeEl) setupFeeEl.textContent = priceData.plateSetupFee;

    if (tableBody) {
      tableBody.innerHTML = priceData.tiers.map((tier) => `
        <tr>
          <td class="tier-qty">${tier.quantity.toLocaleString()} units</td>
          <td class="tier-unit">${priceData.currencySymbol}${tier.unitPrice.toFixed(3)}</td>
          <td><strong>${priceData.currencySymbol}${tier.total.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong></td>
          <td><span class="pricing-badge">${tier.discount}</span></td>
        </tr>
      `).join('');
    }

    // Set initial slider value to second tier
    const slider = document.getElementById('pricing-volume-slider');
    if (slider && priceData.tiers.length > 1) {
      slider.min = priceData.tiers[0].quantity;
      slider.max = priceData.tiers[priceData.tiers.length - 1].quantity;
      slider.step = 1000;
      slider.value = priceData.tiers[1].quantity;
      this.handleVolumeChange(parseInt(slider.value, 10));
    }
  }

  handleVolumeChange(qty) {
    const priceData = window.DATA_CONFIG?.productPrices?.[this.currentCategory];
    if (!priceData) return;

    const unitsDisplay = document.getElementById('calc-units-number');
    const unitPriceDisplay = document.getElementById('calc-unit-price');
    const totalDisplay = document.getElementById('calc-total-price');
    const savingsDisplay = document.getElementById('calc-savings-badge');

    if (unitsDisplay) unitsDisplay.textContent = `${qty.toLocaleString()} Units`;

    // Linear interpolation between tiers
    let matchedTier = priceData.tiers[0];
    for (let i = 0; i < priceData.tiers.length; i++) {
      if (qty >= priceData.tiers[i].quantity) {
        matchedTier = priceData.tiers[i];
      }
    }

    const estimatedUnitPrice = matchedTier.unitPrice;
    const subtotal = qty * estimatedUnitPrice;
    const baseTotal = qty * priceData.tiers[0].unitPrice;
    const savings = Math.max(0, baseTotal - subtotal);

    if (unitPriceDisplay) unitPriceDisplay.textContent = `${priceData.currencySymbol}${estimatedUnitPrice.toFixed(3)}`;
    if (totalDisplay) totalDisplay.textContent = `${priceData.currencySymbol}${subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    if (savingsDisplay) {
      if (savings > 0) {
        savingsDisplay.textContent = `Save ${priceData.currencySymbol}${savings.toFixed(0)} vs Base`;
        savingsDisplay.style.color = 'var(--accent-emerald)';
      } else {
        savingsDisplay.textContent = 'Standard MOQ Tier';
        savingsDisplay.style.color = 'var(--text-secondary)';
      }
    }
  }

  /* --------------------------------------------------------------------------
     3. FINAL PRODUCT LOOK MODAL & BEFORE/AFTER PREVIEW
     -------------------------------------------------------------------------- */
  bindFinalLookModal() {
    if (this.btnFinalLook) {
      this.btnFinalLook.addEventListener('click', () => this.openFinalLookModal());
    }
    if (this.btnCloseFinalLook) {
      this.btnCloseFinalLook.addEventListener('click', () => this.closeFinalLookModal());
    }
    if (this.finalLookModal) {
      this.finalLookModal.addEventListener('click', (e) => {
        if (e.target === this.finalLookModal) this.closeFinalLookModal();
      });
    }
  }

  openFinalLookModal() {
    this.renderFinalLookData();
    if (this.finalLookModal) this.finalLookModal.classList.add('open');
  }

  closeFinalLookModal() {
    if (this.finalLookModal) this.finalLookModal.classList.remove('open');
  }

  renderFinalLookData() {
    const finalData = window.DATA_CONFIG?.finalLookImages?.[this.currentCategory];
    if (!finalData) return;

    const titleEl = document.getElementById('final-look-title');
    const brandEl = document.getElementById('final-look-brand-tag');
    const clientTypeEl = document.getElementById('final-look-client-type');
    const heroImg = document.getElementById('final-look-hero-img');
    const specsContainer = document.getElementById('final-look-specs-container');

    if (titleEl) titleEl.textContent = finalData.title;
    if (brandEl) brandEl.textContent = `PRODUCTION SAMPLE: ${finalData.brandName}`;
    if (clientTypeEl) clientTypeEl.textContent = `Designed for: ${finalData.clientType}`;
    if (heroImg) heroImg.src = finalData.mainMockup;

    if (specsContainer && finalData.finishSpecs) {
      specsContainer.innerHTML = finalData.finishSpecs.map(spec => `
        <div class="spec-bullet">
          <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-width="2" fill="none"/></svg>
          <span>${spec}</span>
        </div>
      `).join('');
    }
  }
}

window.ModalsController = ModalsController;
