/**
 * =============================================================================
 * REFERENCE PHOTO SCRUBBER ENGINE
 * =============================================================================
 * Allows users to scrub fluidly through multi-angle high-resolution reference
 * product photography with inertia damping, zoom scaling, and frame tracking.
 */

class PhotoScrubber {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.options = Object.assign({
      sensitivity: 0.28,
      damping: 0.92,
      onFrameChange: null
    }, options);

    this.photos = [];
    this.currentIndex = 0;
    this.fractionalIndex = 0;
    this.velocity = 0;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.zoomScale = 1.0;

    this.imgElement = document.getElementById('scrubber-image');
    this.frameIndicator = document.getElementById('scrubber-frame-tag');

    this.init();
  }

  init() {
    this.bindEvents();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setPhotos(photoList) {
    if (!photoList || photoList.length === 0) return;
    this.photos = photoList;
    this.currentIndex = 0;
    this.fractionalIndex = 0;
    this.velocity = 0;

    if (this.imgElement) {
      this.imgElement.style.display = 'block';
      this.updateImage();
    }
  }

  updateImage() {
    if (!this.photos || this.photos.length === 0 || !this.imgElement) return;
    const item = this.photos[this.currentIndex];
    this.imgElement.src = item.url;

    if (this.frameIndicator) {
      const current = String(this.currentIndex + 1).padStart(2, '0');
      const total = String(this.photos.length).padStart(2, '0');
      this.frameIndicator.textContent = `REFERENCE PHOTO ${current}/${total} • ${item.label || 'Product Angle'}`;
    }

    if (this.options.onFrameChange) {
      this.options.onFrameChange(this.currentIndex, this.photos.length);
    }
  }

  bindEvents() {
    const el = this.container;

    // Pointer Down
    el.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.velocity = 0;
      el.setPointerCapture(e.pointerId);
    }, { passive: false });

    // Pointer Move
    el.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;

      const deltaX = e.clientX - this.startX;

      if (this.photos.length > 1) {
        const stepDelta = -(deltaX * 0.05);
        this.velocity = stepDelta;
        this.fractionalIndex += stepDelta;
      }

      this.startX = e.clientX;
      this.startY = e.clientY;
      e.preventDefault();
    }, { passive: false });

    // Pointer Up
    const onUp = (e) => {
      if (this.isDragging) {
        this.isDragging = false;
        try { el.releasePointerCapture(e.pointerId); } catch(err) {}
      }
    };
    el.addEventListener('pointerup', onUp, { passive: false });
    el.addEventListener('pointercancel', onUp, { passive: false });

    // Wheel Zoom
    el.addEventListener('wheel', (e) => {
      const zoomFactor = e.deltaY * -0.0015;
      this.setZoom(this.zoomScale + zoomFactor);
      e.preventDefault();
    }, { passive: false });
  }

  setZoom(val) {
    this.zoomScale = Math.max(0.7, Math.min(2.5, val));
    if (this.imgElement) {
      this.imgElement.style.transform = `scale(${this.zoomScale})`;
    }
  }

  animate() {
    requestAnimationFrame(this.animate);

    if (this.photos.length > 1) {
      if (!this.isDragging) {
        this.velocity *= this.options.damping;
        this.fractionalIndex += this.velocity;
      }

      const count = this.photos.length;
      let wrapped = Math.floor(this.fractionalIndex) % count;
      if (wrapped < 0) wrapped += count;

      if (wrapped !== this.currentIndex) {
        this.currentIndex = wrapped;
        this.updateImage();
      }
    }
  }
}

window.PhotoScrubber = PhotoScrubber;
