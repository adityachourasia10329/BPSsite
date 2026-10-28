/**
 * =============================================================================
 * GATE MARQUEE CONTINUOUS 3D & PHOTO ANIMATION
 * =============================================================================
 * Creates an infinite, continuous right-to-left moving carousel of miniature 3D
 * models and reference photos inside the left branding card of the lead gate.
 * At any time, 4 to 5 objects are shown; front objects are scaled and fully
 * opaque, while entering/exiting objects recede in 3D depth and fade.
 */

class GateMarquee {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.items = [
      {
        type: '3d_cup',
        title: '3D Paper Cups (Pair)',
        badge: '3D MODEL',
        renderFn: (c, r) => this.renderMiniCup(c, r)
      },
      {
        type: 'photo',
        title: 'Cup Reference (No Lid)',
        badge: 'REF PHOTO',
        imgUrl: 'assets/products/cup_warli_nolid.jpg'
      },
      {
        type: '3d_wrap',
        title: '3D Food Wrap Roll',
        badge: '3D MODEL',
        renderFn: (c, r) => this.renderMiniWrap(c, r)
      },
      {
        type: 'photo',
        title: 'Deli Wrap Roll Spool',
        badge: 'REF PHOTO',
        imgUrl: 'assets/wrap_paper_roll.jpg'
      },
      {
        type: '3d_container',
        title: '3D Meal Container',
        badge: '3D MODEL',
        renderFn: (c, r) => this.renderMiniContainer(c, r)
      },
      {
        type: 'photo',
        title: 'Container Stack Inspection',
        badge: 'REF PHOTO',
        imgUrl: 'assets/products/containers_prep_stack.jpg'
      },
      {
        type: '3d_tissue',
        title: '3D Embossed Napkins',
        badge: '3D MODEL',
        renderFn: (c, r) => this.renderMiniTissue(c, r)
      },
      {
        type: 'photo',
        title: 'Luxury Napkins Sample',
        badge: 'REF PHOTO',
        imgUrl: 'assets/tissue_papers_luxury.jpg'
      },
      {
        type: 'photo',
        title: '6-Angle Cup Inspection',
        badge: 'REF PHOTO',
        imgUrl: 'assets/products/cup_angles_collage.jpg'
      }
    ];

    this.itemElements = [];
    this.speed = 0.45; // pixels per frame
    this.totalWidth = 0;
    this.itemSpacing = 160; // spacing between item centers
    this.offset = 0;
    this.miniCanvases = [];

    this.init();
  }

  init() {
    this.container.innerHTML = '';
    const track = document.createElement('div');
    track.className = 'marquee-3d-track';
    this.container.appendChild(track);
    this.track = track;

    this.totalWidth = this.items.length * this.itemSpacing;

    // Create DOM card elements for each item
    this.items.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = `marquee-card marquee-card-${item.type.startsWith('3d') ? '3d' : 'photo'}`;

      const badge = document.createElement('span');
      badge.className = 'marquee-card-badge';
      badge.textContent = item.badge;
      card.appendChild(badge);

      const mediaWrap = document.createElement('div');
      mediaWrap.className = 'marquee-card-media';

      if (item.type.startsWith('3d')) {
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 160;
        canvas.className = 'marquee-mini-canvas';
        mediaWrap.appendChild(canvas);
        this.setupMiniThreeScene(canvas, item.type);
      } else {
        const img = document.createElement('img');
        img.src = item.imgUrl;
        img.alt = item.title;
        img.className = 'marquee-card-img';
        mediaWrap.appendChild(img);
      }
      card.appendChild(mediaWrap);

      const label = document.createElement('div');
      label.className = 'marquee-card-title';
      label.textContent = item.title;
      card.appendChild(label);

      this.track.appendChild(card);
      this.itemElements.push({ el: card, baseIndex: index });
    });

    // Start 60fps continuous animation
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupMiniThreeScene(canvas, type) {
    if (typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
    camera.position.set(0, 0, 3.8);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(160, 160);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const amb = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(amb);
    const dir = new THREE.DirectionalLight(0xfff5ea, 1.2);
    dir.position.set(2, 4, 3);
    scene.add(dir);

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    if (type === '3d_cup') {
      // Cup with lid & cup without lid miniature
      const c1Geo = new THREE.CylinderGeometry(0.45, 0.3, 1.1, 24);
      const c1Mat = new THREE.MeshStandardMaterial({ color: 0x18181E, roughness: 0.5 });
      const c1 = new THREE.Mesh(c1Geo, c1Mat);
      c1.position.set(-0.55, 0, 0);

      const lidGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.12, 24);
      const lidMat = new THREE.MeshStandardMaterial({ color: 0x33333C, roughness: 0.3 });
      const lid = new THREE.Mesh(lidGeo, lidMat);
      lid.position.set(-0.55, 0.6, 0);

      const c2Geo = new THREE.CylinderGeometry(0.45, 0.3, 1.1, 24);
      const c2Mat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.6 });
      const c2 = new THREE.Mesh(c2Geo, c2Mat);
      c2.position.set(0.55, 0, 0);

      modelGroup.add(c1);
      modelGroup.add(lid);
      modelGroup.add(c2);
    } else if (type === '3d_wrap') {
      const spoolGeo = new THREE.CylinderGeometry(0.48, 0.48, 1.4, 24);
      const spoolMat = new THREE.MeshStandardMaterial({ color: 0xF7F4EB, roughness: 0.6 });
      const spool = new THREE.Mesh(spoolGeo, spoolMat);
      spool.rotation.z = Math.PI / 2;

      const sheetGeo = new THREE.PlaneGeometry(1.2, 0.9);
      const sheetMat = new THREE.MeshStandardMaterial({ color: 0xF0EDE6, side: THREE.DoubleSide });
      const sheet = new THREE.Mesh(sheetGeo, sheetMat);
      sheet.rotation.x = -Math.PI / 2.5;
      sheet.position.set(0, -0.4, 0.5);

      modelGroup.add(spool);
      modelGroup.add(sheet);
    } else if (type === '3d_container') {
      const boxGeo = new THREE.BoxGeometry(1.4, 0.5, 0.9);
      const boxMat = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.4 });
      const box = new THREE.Mesh(boxGeo, boxMat);

      const lidGeo = new THREE.BoxGeometry(1.44, 0.1, 0.94);
      const lidMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, opacity: 0.7, transparent: true });
      const lid = new THREE.Mesh(lidGeo, lidMat);
      lid.position.y = 0.3;

      modelGroup.add(box);
      modelGroup.add(lid);
    } else if (type === '3d_tissue') {
      const napGeo = new THREE.BoxGeometry(1.1, 0.4, 1.1);
      const napMat = new THREE.MeshStandardMaterial({ color: 0x222228, roughness: 0.8 });
      const nap = new THREE.Mesh(napGeo, napMat);

      const foilGeo = new THREE.BoxGeometry(0.5, 0.42, 0.5);
      const foilMat = new THREE.MeshStandardMaterial({ color: 0xD4AF37, roughness: 0.3, metalness: 0.6 });
      const foil = new THREE.Mesh(foilGeo, foilMat);

      modelGroup.add(nap);
      modelGroup.add(foil);
    }

    this.miniCanvases.push({ renderer, scene, camera, modelGroup });
  }

  animate() {
    requestAnimationFrame(this.animate);

    // Increment continuous offset moving right-to-left
    this.offset += this.speed;
    if (this.offset >= this.totalWidth) {
      this.offset -= this.totalWidth;
    }

    const viewportWidth = this.container.clientWidth || 460;
    const centerPoint = viewportWidth / 2;

    // Update item positions and depth/opacity curves
    this.itemElements.forEach((itemObj, i) => {
      // Calculate current x position
      let x = (i * this.itemSpacing - this.offset) % this.totalWidth;
      if (x < -this.itemSpacing) {
        x += this.totalWidth;
      }

      // Distance from center of viewport (-1 to +1 normalized)
      const distFromCenter = (x - centerPoint) / (viewportWidth * 0.55);
      const absDist = Math.abs(distFromCenter);

      // Depth curves: center items are opaque (1.0) and larger, edges recede and fade
      let opacity = Math.max(0.18, 1.0 - Math.pow(absDist, 1.6) * 0.9);
      let scale = Math.max(0.72, 1.06 - absDist * 0.32);
      let translateZ = (1.0 - Math.min(1, absDist)) * 40 - 20;

      // Wrap-around boundary smoothing
      if (x < 0 || x > viewportWidth) {
        opacity *= Math.max(0, 1 - (Math.abs(x - centerPoint) - centerPoint) / 60);
      }

      itemObj.el.style.transform = `translate3d(${x}px, 0, ${translateZ}px) scale(${scale})`;
      itemObj.el.style.opacity = Math.max(0, Math.min(1, opacity)).toFixed(3);
      itemObj.el.style.zIndex = Math.round((1 - absDist) * 100);
    });

    // Gently rotate miniature 3D models
    this.miniCanvases.forEach(item => {
      item.modelGroup.rotation.y += 0.014;
      item.renderer.render(item.scene, item.camera);
    });
  }
}

window.GateMarquee = GateMarquee;
