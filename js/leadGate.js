/**
 * =============================================================================
 * MANDATORY LEAD-CAPTURE GATE CONTROLLER
 * =============================================================================
 * Enforces mandatory B2B registration before unlocking the 360° Studio.
 * Validates all required inputs, manages localStorage persistence,
 * and structures future webhook/CRM integrations.
 */

class LeadGate {
  constructor(options = {}) {
    this.storageKey = 'bps_b2b_lead_session';
    this.appEl = document.getElementById('app');
    this.gateOverlayEl = document.getElementById('lead-gate-modal');
    this.gateFormEl = document.getElementById('lead-gate-form');
    this.sessionIndicatorEl = document.getElementById('session-indicator-text');
    this.onUnlockCallback = options.onUnlock || null;

    this.currentLead = null;
    this.init();
  }

  init() {
    if (!this.gateOverlayEl || !this.gateFormEl) return;

    // Check if previously authenticated in this browser session (supporting migration)
    const savedSession = localStorage.getItem(this.storageKey) || localStorage.getItem('aura_b2b_lead_session');
    if (savedSession) {
      try {
        this.currentLead = JSON.parse(savedSession);
        this.unlockWorkspace(false); // immediate unlock without slow animation
        this.updateSessionUI();
        return;
      } catch (e) {
        console.warn('Failed parsing saved lead session, re-prompting gate.', e);
        localStorage.removeItem(this.storageKey);
      }
    }

    // Lock workspace preview
    this.lockWorkspace();

    // Bind form submission
    this.gateFormEl.addEventListener('submit', (e) => this.handleSubmit(e));

    // Prevent ESC key or outside click dismissal
    window.addEventListener('keydown', (e) => {
      if (this.isLocked() && e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  }

  isLocked() {
    return !this.currentLead;
  }

  lockWorkspace() {
    if (this.appEl) {
      this.appEl.classList.remove('workspace-unlocked');
      this.appEl.classList.add('workspace-gated');
    }
    this.gateOverlayEl.classList.remove('hidden');
    this.gateOverlayEl.classList.remove('animating-out');
  }

  unlockWorkspace(animate = true) {
    if (animate) {
      this.gateOverlayEl.classList.add('animating-out');
      setTimeout(() => {
        this.gateOverlayEl.classList.add('hidden');
        if (this.appEl) {
          this.appEl.classList.remove('workspace-gated');
          this.appEl.classList.add('workspace-unlocked');
        }
        if (this.onUnlockCallback) this.onUnlockCallback(this.currentLead);
      }, 450);
    } else {
      this.gateOverlayEl.classList.add('hidden');
      if (this.appEl) {
        this.appEl.classList.remove('workspace-gated');
        this.appEl.classList.add('workspace-unlocked');
      }
      if (this.onUnlockCallback) this.onUnlockCallback(this.currentLead);
    }
  }

  updateSessionUI() {
    if (this.sessionIndicatorEl && this.currentLead) {
      const company = this.currentLead.businessType || 'Enterprise';
      const name = this.currentLead.fullName || 'Client';
      this.sessionIndicatorEl.textContent = `VERIFIED B2B: ${name.split(' ')[0]} (${company})`;
    }
  }

  validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  }

  validatePhone(phone) {
    // Allows international formats, min 8 digits
    const cleaned = String(phone).replace(/[\s\-\(\)\+]/g, '');
    return cleaned.length >= 8 && /^\d+$/.test(cleaned);
  }

  handleSubmit(e) {
    e.preventDefault();
    let hasError = false;

    // 1. Full Name
    const nameInput = document.getElementById('lead-name');
    const nameVal = nameInput ? nameInput.value.trim() : '';
    if (!nameVal || nameVal.length < 2) {
      this.showInputError(nameInput, 'Please provide your full legal or representative name.');
      hasError = true;
    } else {
      this.clearInputError(nameInput);
    }

    // 2. Business Type
    const bizInput = document.getElementById('lead-business');
    const bizVal = bizInput ? bizInput.value.trim() : '';
    if (!bizVal || bizVal.length < 2) {
      this.showInputError(bizInput, 'Please enter your business type (e.g. Café, QSR, Cloud Kitchen).');
      hasError = true;
    } else {
      this.clearInputError(bizInput);
    }

    // 3. Email
    const emailInput = document.getElementById('lead-email');
    const emailVal = emailInput ? emailInput.value.trim() : '';
    if (!this.validateEmail(emailVal)) {
      this.showInputError(emailInput, 'Please provide a valid corporate or business email address.');
      hasError = true;
    } else {
      this.clearInputError(emailInput);
    }

    // 4. Phone
    const phoneInput = document.getElementById('lead-phone');
    const phoneVal = phoneInput ? phoneInput.value.trim() : '';
    if (!this.validatePhone(phoneVal)) {
      this.showInputError(phoneInput, 'Please provide a valid direct phone/WhatsApp number (min 8 digits).');
      hasError = true;
    } else {
      this.clearInputError(phoneInput);
    }

    // 5. Query / Requirements
    const queryInput = document.getElementById('lead-query');
    const queryVal = queryInput ? queryInput.value.trim() : '';
    if (!queryVal || queryVal.length < 5) {
      this.showInputError(queryInput, 'Please provide a brief summary of your packaging quantities or requirements.');
      hasError = true;
    } else {
      this.clearInputError(queryInput);
    }

    // 6. Referral Source
    const referralRadio = document.querySelector('input[name="lead_referral"]:checked');
    const referralContainer = document.getElementById('lead-referral-container');
    if (!referralRadio) {
      if (referralContainer) {
        let errEl = referralContainer.querySelector('.form-error-msg');
        if (errEl) errEl.classList.add('visible');
      }
      hasError = true;
    } else {
      if (referralContainer) {
        let errEl = referralContainer.querySelector('.form-error-msg');
        if (errEl) errEl.classList.remove('visible');
      }
    }

    if (hasError) return;

    // Prepare lead payload
    const leadData = {
      fullName: nameVal,
      businessType: bizVal,
      email: emailVal,
      phone: phoneVal,
      query: queryVal,
      referralSource: referralRadio.value,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    // Store in instance and local storage
    this.currentLead = leadData;
    localStorage.setItem(this.storageKey, JSON.stringify(leadData));

    // Dispatch lead to external webhook / CRM pipeline handler
    this.dispatchLeadToCRM(leadData);

    // Update UI and smoothly unlock stage
    this.updateSessionUI();
    this.unlockWorkspace(true);
  }

  showInputError(inputEl, msg) {
    if (!inputEl) return;
    inputEl.classList.add('error');
    const parent = inputEl.closest('.form-group');
    if (parent) {
      const errEl = parent.querySelector('.form-error-msg');
      if (errEl) {
        errEl.textContent = msg;
        errEl.classList.add('visible');
      }
    }
  }

  clearInputError(inputEl) {
    if (!inputEl) return;
    inputEl.classList.remove('error');
    const parent = inputEl.closest('.form-group');
    if (parent) {
      const errEl = parent.querySelector('.form-error-msg');
      if (errEl) errEl.classList.remove('visible');
    }
  }

  /**
   * Structured Handler for enterprise Webhook, Hubspot, or CRM API
   */
  dispatchLeadToCRM(leadData) {
    console.log('[LEAD CAPTURED] Transmitting B2B Qualified Lead:', leadData);

    // If an enterprise webhook endpoint is configured, trigger POST
    const webhookUrl = window.DATA_CONFIG?.companyInfo?.leadWebhookEndpoint || null;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      }).catch(err => console.warn('Lead webhook transmission background error:', err));
    }
  }

  // Developer utility to reset gate for testing
  resetSession() {
    localStorage.removeItem(this.storageKey);
    this.currentLead = null;
    this.lockWorkspace();
    if (this.sessionIndicatorEl) {
      this.sessionIndicatorEl.textContent = 'SESSION: GATED (REQUIRED)';
    }
  }
}

window.LeadGate = LeadGate;
