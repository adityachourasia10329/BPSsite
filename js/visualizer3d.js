/**
 * =============================================================================
 * REAL-TIME 360° 3D PRODUCT VISUALIZER ENGINE (THREE.JS)
 * =============================================================================
 * Implements omnidirectional vector rotation (X and Y axes), inertia damping,
 * touch pinch-to-zoom, mousewheel zoom, PBR lighting, and procedural 3D models
 * for Cups, Food Wraps, Microwave Containers, and Printed Tissues.
 */

class Visualizer3D {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error(`Canvas with id "${canvasId}" not found.`);
      return;
    }

    this.options = Object.assign({
      minDistance: 2.2,
      maxDistance: 7.5,
      initialDistance: 7.5, // Always start at the smallest size on the zoom scale
      dampingFactor: 0.065,
      rotationSensitivity: 0.0055,
      zoomSensitivity: 0.002,
      onAngleUpdate: null,
      onZoomUpdate: null
    }, options);

    // Three.js Core
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.productRoot = null;
    this.currentMeshGroup = null;
    this.shadowPlane = null;

    // Exploded View State
    this.isExploded = false;
    this.isWireframe = false;
    this.autoRotate = false;
    this.autoRotateSpeed = 0.008;

    // Interactive Kinematics & Inertia
    this.isDragging = false;
    this.prevPointerPos = { x: 0, y: 0 };
    this.targetRotation = { x: 0.15, y: -0.4 };
    this.currentRotation = { x: 0.15, y: -0.4 };
    this.velocity = { x: 0, y: 0 };
    this.targetDistance = this.options.maxDistance;
    this.currentDistance = this.options.maxDistance;

    // Multi-touch tracking
    this.touchPinchDist = 0;

    // Texture Cache
    this.textureLoader = new THREE.TextureLoader();
    this.generatedTextures = {};

    this.currentCategory = 'cups';
    this.init();
  }

  init() {
    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0A0A0C, 0.08);

    // 2. Camera setup
    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
    this.camera.position.set(0, 0, this.currentDistance);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // 4. Product Container
    this.productRoot = new THREE.Group();
    this.scene.add(this.productRoot);

    // 5. Studio Lighting
    this.setupLighting();

    // 6. Studio Shadow Pedestal
    this.setupShadowPedestal();

    // 7. Input Event Listeners (with passive: false)
    this.bindPointerEvents();

    // 8. Load Initial Model (Cups)
    this.loadProductModel('cups');

    // 9. Resize Observer
    window.addEventListener('resize', () => this.handleResize());

    // 10. Start Animation Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupLighting() {
    // Soft ambient illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    this.scene.add(ambientLight);

    // Primary Key Light (Top-Front Right)
    this.keyLight = new THREE.DirectionalLight(0xfff8f0, 1.4);
    this.keyLight.position.set(4, 6, 5);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 15;
    this.keyLight.shadow.bias = -0.001;
    this.scene.add(this.keyLight);

    // Fill Light (Cool Studio Tint, Left)
    const fillLight = new THREE.DirectionalLight(0xd4e2ff, 0.8);
    fillLight.position.set(-5, 2, 3);
    this.scene.add(fillLight);

    // Back Rim Light (Edge definition)
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.1);
    rimLight.position.set(0, 4, -5);
    this.scene.add(rimLight);

    // Under-Stage Uplight (for bottom details)
    const underLight = new THREE.DirectionalLight(0x444455, 0.4);
    underLight.position.set(0, -4, 2);
    this.scene.add(underLight);
  }

  setupShadowPedestal() {
    // Subtle shadow receiving floor disc
    const planeGeo = new THREE.PlaneGeometry(8, 8);
    const planeMat = new THREE.ShadowMaterial({
      opacity: 0.35
    });
    this.shadowPlane = new THREE.Mesh(planeGeo, planeMat);
    this.shadowPlane.rotation.x = -Math.PI / 2;
    this.shadowPlane.position.y = -1.15;
    this.shadowPlane.receiveShadow = true;
    this.scene.add(this.shadowPlane);

    // Decorative concentric subtle ring
    const ringGeo = new THREE.RingGeometry(1.2, 1.21, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x888899,
      opacity: 0.15,
      transparent: true,
      side: THREE.DoubleSide
    });
    const stageRing = new THREE.Mesh(ringGeo, ringMat);
    stageRing.rotation.x = -Math.PI / 2;
    stageRing.position.y = -1.14;
    this.scene.add(stageRing);
  }

  /**
   * Generates high-res custom branded canvas texture for 3D meshes
   */
  createBrandingTexture(type) {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    if (type === 'cup') {
      // Matte Charcoal / Obsidian Base
      ctx.fillStyle = '#111113';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle Kraft warm band
      ctx.fillStyle = '#C89D66';
      ctx.fillRect(0, 780, canvas.width, 244);

      // Geometric Flexo Graphic Wave & Lines
      ctx.strokeStyle = '#2A2A30';
      ctx.lineWidth = 4;
      for (let i = 0; i < canvas.width; i += 60) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 120, 780);
        ctx.stroke();
      }

      // Brand Logo & Typography
      ctx.fillStyle = '#F5F5F3';
      ctx.font = 'bold 96px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ARCHITECT COFFEE', canvas.width * 0.28, 420);
      ctx.fillText('ARCHITECT COFFEE', canvas.width * 0.78, 420);

      ctx.font = '600 36px "Space Mono", monospace';
      ctx.fillStyle = '#E09852';
      ctx.fillText('SINGLE ORIGIN / AQUEOUS BIO-BARRIER 12 OZ', canvas.width * 0.28, 490);
      ctx.fillText('SINGLE ORIGIN / AQUEOUS BIO-BARRIER 12 OZ', canvas.width * 0.78, 490);

      // Minimalist Geometric Emblem
      ctx.strokeStyle = '#E09852';
      ctx.lineWidth = 8;
      ctx.strokeRect(canvas.width * 0.28 - 70, 220, 140, 140);
      ctx.strokeRect(canvas.width * 0.78 - 70, 220, 140, 140);

      // Calibration telemetry line
      ctx.fillStyle = '#777780';
      ctx.font = '32px "Space Mono", monospace';
      ctx.fillText('CALIBRATED FOR BARISTA EXTRACTION [90MM APERTURE]', canvas.width * 0.5, 920);

    } else if (type === 'wrap') {
      // Parchment / Butter paper texture
      ctx.fillStyle = '#F7F4EB';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Repeating Deli Tartan Navy Grid
      ctx.strokeStyle = '#1E3A8A';
      ctx.lineWidth = 3;
      const step = 140;
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Repeating Brand Badges
      ctx.fillStyle = '#1E3A8A';
      ctx.font = 'bold 38px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      for (let x = step / 2; x < canvas.width; x += step * 2) {
        for (let y = step / 2; y < canvas.height; y += step * 2) {
          ctx.fillText('HEIRLOOM', x, y);
          ctx.font = '600 18px "Space Mono", monospace';
          ctx.fillText('DELI PROVISIONS', x, y + 26);
          ctx.font = 'bold 38px "Space Grotesk", sans-serif';
        }
      }

    } else if (type === 'container_sleeve') {
      // Unbleached Kraft paper background
      ctx.fillStyle = '#C29B68';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Organic Kraft fine fiber texture
      ctx.fillStyle = '#B38C5A';
      for (let i = 0; i < 2000; i++) {
        const rx = Math.random() * canvas.width;
        const ry = Math.random() * canvas.height;
        ctx.fillRect(rx, ry, 2, 2);
      }

      // Terra Kitchen Brand Center
      ctx.fillStyle = '#1C1917';
      ctx.font = 'bold 110px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TERRA KITCHEN', canvas.width * 0.5, 380);

      ctx.font = '600 44px "Space Mono", monospace';
      ctx.fillText('GOURMET REUSABLE MEAL CONTAINER — 750 ML', canvas.width * 0.5, 470);

      ctx.font = '32px "Space Mono", monospace';
      ctx.fillText('MICROWAVEABLE & FREEZER CERTIFIED / FDA 21 CFR', canvas.width * 0.5, 540);

    } else if (type === 'tissue') {
      // Deep obsidian charcoal napkin base
      ctx.fillStyle = '#17171C';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Fine linen waffle embossing along border
      ctx.strokeStyle = '#272732';
      ctx.lineWidth = 14;
      ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);
      ctx.strokeRect(90, 90, canvas.width - 180, canvas.height - 180);

      // Gold Foil Center Stamp
      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 96px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('THE CASK & OAK', canvas.width * 0.5, 480);

      ctx.font = '600 40px "Space Mono", monospace';
      ctx.fillText('LUXURY COCKTAIL EMBOSSED NAPKINS — 3 PLY', canvas.width * 0.5, 570);

    } else if (type === 'cup_warli') {
      // 5. WARLI TRIBAL FOLK ART (Without Lid Cup - referencing user's edited image)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Top green double accent lines
      ctx.strokeStyle = '#1E6B34';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, 110);
      ctx.lineTo(canvas.width, 110);
      ctx.stroke();

      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 126);
      ctx.lineTo(canvas.width, 126);
      ctx.stroke();

      // Bottom green border: double parallel lines with green triangle zigzag (▲▲▲▲▲)
      const bY = 810;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, bY);
      ctx.lineTo(canvas.width, bY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, bY + 80);
      ctx.lineTo(canvas.width, bY + 80);
      ctx.stroke();

      ctx.fillStyle = '#1E6B34';
      const triWidth = 36;
      for (let x = 0; x < canvas.width; x += triWidth) {
        ctx.beginPath();
        ctx.moveTo(x, bY + 70);
        ctx.lineTo(x + triWidth / 2, bY + 16);
        ctx.lineTo(x + triWidth, bY + 70);
        ctx.closePath();
        ctx.fill();
      }

      // Warli tribal figures dancing around the circumference in rich green (#1E6B34)
      const greenColor = '#1E6B34';
      ctx.fillStyle = greenColor;
      ctx.strokeStyle = greenColor;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const numFigures = 10;
      const spacing = canvas.width / numFigures;
      for (let i = 0; i < numFigures; i++) {
        const cx = i * spacing + spacing / 2;
        const cy = 460;

        // Head
        ctx.beginPath();
        ctx.arc(cx, cy - 140, 26, 0, Math.PI * 2);
        ctx.fill();

        // Hair bun
        ctx.beginPath();
        ctx.arc(cx - 24, cy - 150, 14, 0, Math.PI * 2);
        ctx.fill();

        // Upper triangle body
        ctx.beginPath();
        ctx.moveTo(cx - 52, cy - 100);
        ctx.lineTo(cx + 52, cy - 100);
        ctx.lineTo(cx, cy - 18);
        ctx.closePath();
        ctx.fill();

        // Lower triangle body
        ctx.beginPath();
        ctx.moveTo(cx, cy - 18);
        ctx.lineTo(cx - 56, cy + 64);
        ctx.lineTo(cx + 56, cy + 64);
        ctx.closePath();
        ctx.fill();

        // Dancing stick legs
        ctx.beginPath();
        if (i % 2 === 0) {
          ctx.moveTo(cx - 20, cy + 64);
          ctx.lineTo(cx - 65, cy + 130);
          ctx.lineTo(cx - 85, cy + 120);
          ctx.moveTo(cx + 20, cy + 64);
          ctx.lineTo(cx + 45, cy + 110);
          ctx.lineTo(cx + 70, cy + 170);
        } else {
          ctx.moveTo(cx - 20, cy + 64);
          ctx.lineTo(cx - 40, cy + 110);
          ctx.lineTo(cx - 65, cy + 170);
          ctx.moveTo(cx + 20, cy + 64);
          ctx.lineTo(cx + 65, cy + 130);
          ctx.lineTo(cx + 85, cy + 120);
        }
        ctx.stroke();

        // Arms holding instruments / shield / dance
        ctx.beginPath();
        if (i % 3 === 0) {
          // Tutari / Trumpet horn
          ctx.moveTo(cx - 40, cy - 90);
          ctx.lineTo(cx - 85, cy - 70);
          ctx.moveTo(cx + 40, cy - 90);
          ctx.lineTo(cx + 80, cy - 50);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx + 75, cy - 50);
          ctx.lineTo(cx + 140, cy - 100);
          ctx.lineTo(cx + 125, cy - 10);
          ctx.closePath();
          ctx.fill();
        } else if (i % 3 === 1) {
          // Shield / fan with spokes
          ctx.moveTo(cx - 40, cy - 90);
          ctx.lineTo(cx - 80, cy - 30);
          ctx.moveTo(cx + 40, cy - 90);
          ctx.lineTo(cx + 70, cy - 130);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(cx - 95, cy - 30, 42, -Math.PI / 2, Math.PI / 2);
          ctx.stroke();
        } else {
          // Dynamic dancing arms
          ctx.moveTo(cx - 40, cy - 90);
          ctx.lineTo(cx - 85, cy - 140);
          ctx.lineTo(cx - 60, cy - 170);
          ctx.moveTo(cx + 40, cy - 90);
          ctx.lineTo(cx + 85, cy - 40);
          ctx.stroke();
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * Loads product category 3D meshes
   */
  loadProductModel(categoryId) {
    this.currentCategory = categoryId;

    // Clean previous mesh group
    if (this.currentMeshGroup) {
      this.productRoot.remove(this.currentMeshGroup);
      this.disposeObject(this.currentMeshGroup);
    }

    this.currentMeshGroup = new THREE.Group();
    this.productRoot.add(this.currentMeshGroup);

    // Build category-specific geometry
    switch (categoryId) {
      case 'cups':
        this.buildCupModel();
        break;
      case 'wraps':
        this.buildWrapModel();
        break;
      case 'containers':
        this.buildContainerModel();
        break;
      case 'tissues':
        this.buildTissueModel();
        break;
      default:
        this.buildCupModel();
    }

    // Set initial target rotation and smooth transition
    const cfg = window.DATA_CONFIG?.productMedia?.[categoryId];
    if (cfg && cfg.defaultAngle) {
      this.targetRotation.x = cfg.defaultAngle.x;
      this.targetRotation.y = cfg.defaultAngle.y;
    }

    // REQUIREMENT 1: Always open in smallest size on zoom scale (maxDistance)
    this.targetDistance = this.options.maxDistance;
    this.currentDistance = this.options.maxDistance;
    if (this.camera) this.camera.position.z = this.options.maxDistance;
    if (this.options.onZoomUpdate) {
      this.options.onZoomUpdate(0);
    }
  }

  /**
   * 1. CUPS MODEL: Dual Cups Side-by-Side (Left: With Lid, Right: Without Lid Warli Art)
   */
  buildCupModel() {
    const group = this.currentMeshGroup;
    group.name = 'cups_pair_model';

    // Shared Materials & Geometries
    const lipGeo = new THREE.TorusGeometry(0.85, 0.04, 16, 64);
    const lipMat = new THREE.MeshStandardMaterial({
      color: 0xF5F5F3,
      roughness: 0.5,
      metalness: 0.05,
      wireframe: this.isWireframe
    });

    const bottomGeo = new THREE.CircleGeometry(0.59, 48);
    const bottomMat = new THREE.MeshStandardMaterial({
      color: 0xF0EDE6,
      roughness: 0.7,
      side: THREE.DoubleSide
    });

    const crimpGeo = new THREE.TorusGeometry(0.58, 0.025, 16, 48);

    // -------------------------------------------------------------
    // LEFT CUP: With Lid (Moved slightly to the left: x = -1.25)
    // -------------------------------------------------------------
    const cupLeftGroup = new THREE.Group();
    cupLeftGroup.position.set(-1.25, 0, 0);

    const brandTextureLeft = this.createBrandingTexture('cup');
    const cupLeftGeo = new THREE.CylinderGeometry(0.85, 0.58, 2.0, 64, 1, true);
    const cupLeftMat = new THREE.MeshStandardMaterial({
      map: brandTextureLeft,
      roughness: 0.62,
      metalness: 0.08,
      side: THREE.DoubleSide,
      wireframe: this.isWireframe
    });
    const cupLeftMesh = new THREE.Mesh(cupLeftGeo, cupLeftMat);
    cupLeftMesh.castShadow = true;
    cupLeftMesh.receiveShadow = true;
    cupLeftGroup.add(cupLeftMesh);
    this.mainBodyMesh = cupLeftMesh;

    // Rolled Top Lip (Left)
    const lipLeft = new THREE.Mesh(lipGeo, lipMat);
    lipLeft.rotation.x = Math.PI / 2;
    lipLeft.position.y = 1.0;
    cupLeftGroup.add(lipLeft);

    // Recessed Bottom Seal Plate (Left)
    const bottomLeft = new THREE.Mesh(bottomGeo, bottomMat);
    bottomLeft.rotation.x = Math.PI / 2;
    bottomLeft.position.y = -0.88;
    cupLeftGroup.add(bottomLeft);

    // Bottom crimp ring (Left)
    const crimpLeft = new THREE.Mesh(crimpGeo, lipMat);
    crimpLeft.rotation.x = Math.PI / 2;
    crimpLeft.position.y = -1.0;
    cupLeftGroup.add(crimpLeft);

    // Snap-On Lid on Left Cup (can lift in exploded view)
    const lidGroup = new THREE.Group();
    lidGroup.name = 'exploded_layer';
    lidGroup.position.y = 1.02;

    const lidRimGeo = new THREE.TorusGeometry(0.87, 0.045, 16, 64);
    const lidMat = new THREE.MeshStandardMaterial({
      color: 0x1A1A20,
      roughness: 0.35,
      metalness: 0.25,
      wireframe: this.isWireframe
    });
    const lidRim = new THREE.Mesh(lidRimGeo, lidMat);
    lidRim.rotation.x = Math.PI / 2;
    lidGroup.add(lidRim);

    const lidTopGeo = new THREE.CylinderGeometry(0.83, 0.87, 0.2, 64, 1, false);
    const lidTop = new THREE.Mesh(lidTopGeo, lidMat);
    lidTop.position.y = 0.1;
    lidGroup.add(lidTop);

    // Sip hole aperture
    const sipGeo = new THREE.BoxGeometry(0.18, 0.04, 0.09);
    const sipMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const sipHole = new THREE.Mesh(sipGeo, sipMat);
    sipHole.position.set(0, 0.2, 0.58);
    lidGroup.add(sipHole);

    cupLeftGroup.add(lidGroup);
    group.add(cupLeftGroup);

    // -------------------------------------------------------------
    // RIGHT CUP: Without Lid (Warli tribal green print - x = +1.25)
    // -------------------------------------------------------------
    const cupRightGroup = new THREE.Group();
    cupRightGroup.position.set(1.25, 0, 0);

    const warliTexture = this.createBrandingTexture('cup_warli');
    const cupRightGeo = new THREE.CylinderGeometry(0.85, 0.58, 2.0, 64, 1, true);
    const cupRightMat = new THREE.MeshStandardMaterial({
      map: warliTexture,
      roughness: 0.55,
      metalness: 0.03,
      side: THREE.DoubleSide,
      wireframe: this.isWireframe
    });
    const cupRightMesh = new THREE.Mesh(cupRightGeo, cupRightMat);
    cupRightMesh.castShadow = true;
    cupRightMesh.receiveShadow = true;
    cupRightGroup.add(cupRightMesh);

    // Open Paper Rolled Lip (Right Cup without lid)
    const lipRight = new THREE.Mesh(lipGeo, lipMat);
    lipRight.rotation.x = Math.PI / 2;
    lipRight.position.y = 1.0;
    cupRightGroup.add(lipRight);

    // Bottom disc (Right)
    const bottomRight = new THREE.Mesh(bottomGeo, bottomMat);
    bottomRight.rotation.x = Math.PI / 2;
    bottomRight.position.y = -0.88;
    cupRightGroup.add(bottomRight);

    // Bottom crimp ring (Right)
    const crimpRight = new THREE.Mesh(crimpGeo, lipMat);
    crimpRight.rotation.x = Math.PI / 2;
    crimpRight.position.y = -1.0;
    cupRightGroup.add(crimpRight);

    group.add(cupRightGroup);

    // Exploded View targets the lid on the left cup
    this.explodedPart = lidGroup;
    this.explodedPartBasePos = new THREE.Vector3(0, 1.02, 0);
    this.explodedPartTargetPos = new THREE.Vector3(0, 2.1, 0);
  }

  /**
   * 2. WRAP ROLL & SHEETS MODEL: Master roll with unrolled branded food sheet
   */
  buildWrapModel() {
    const group = this.currentMeshGroup;
    group.name = 'wrap_model';

    const wrapTexture = this.createBrandingTexture('wrap');

    // Inner Cardboard Tube Core
    const coreGeo = new THREE.CylinderGeometry(0.35, 0.35, 2.6, 48, 1, true);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x967049,
      roughness: 0.9,
      side: THREE.DoubleSide
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.rotation.z = Math.PI / 2;
    group.add(coreMesh);

    // Wound Paper Spool Cylinder
    const spoolGeo = new THREE.CylinderGeometry(0.75, 0.75, 2.5, 64, 1, false);
    const spoolMat = new THREE.MeshStandardMaterial({
      map: wrapTexture,
      roughness: 0.5,
      metalness: 0.05,
      wireframe: this.isWireframe
    });
    const spoolMesh = new THREE.Mesh(spoolGeo, spoolMat);
    spoolMesh.rotation.z = Math.PI / 2;
    spoolMesh.castShadow = true;
    group.add(spoolMesh);
    this.mainBodyMesh = spoolMesh;

    // Unrolled Sheet Flap draping outward (curved plane)
    const sheetGeo = new THREE.PlaneGeometry(2.4, 2.0, 32, 32);
    // Add subtle curvature to plane
    const pos = sheetGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      pos.setZ(i, Math.sin(y * 1.5) * 0.12);
    }
    sheetGeo.computeVertexNormals();

    const sheetMat = new THREE.MeshStandardMaterial({
      map: wrapTexture,
      roughness: 0.45,
      metalness: 0.02,
      side: THREE.DoubleSide,
      wireframe: this.isWireframe
    });
    const sheetMesh = new THREE.Mesh(sheetGeo, sheetMat);
    sheetMesh.rotation.x = -Math.PI / 2.3;
    sheetMesh.position.set(0, -0.65, 0.95);
    sheetMesh.receiveShadow = true;
    group.add(sheetMesh);

    // Exploded View: Sliding Roll Dispenser Spindle
    const spindleGeo = new THREE.CylinderGeometry(0.18, 0.18, 3.2, 32);
    const spindleMat = new THREE.MeshStandardMaterial({
      color: 0xD0D0D5,
      metalness: 0.85,
      roughness: 0.2
    });
    const spindleMesh = new THREE.Mesh(spindleGeo, spindleMat);
    spindleMesh.rotation.z = Math.PI / 2;
    group.add(spindleMesh);

    this.explodedPart = sheetMesh;
    this.explodedPartBasePos = new THREE.Vector3(0, -0.65, 0.95);
    this.explodedPartTargetPos = new THREE.Vector3(0, -0.65, 2.2);
  }

  /**
   * 3. MEAL CONTAINERS MODEL: Microwaveable base with anti-fog snap lid and branded kraft sleeve
   */
  buildContainerModel() {
    const group = this.currentMeshGroup;
    group.name = 'container_model';

    const sleeveTexture = this.createBrandingTexture('container_sleeve');

    // Base Box (Black Polypropylene, rounded box proportions: width 2.4, height 0.8, depth 1.6)
    const baseGeo = new THREE.BoxGeometry(2.4, 0.75, 1.6, 16, 8, 16);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x141416,
      roughness: 0.35,
      metalness: 0.1,
      wireframe: this.isWireframe
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    group.add(baseMesh);
    this.mainBodyMesh = baseMesh;

    // Bevelled Perimeter Snap Lip
    const lipGeo = new THREE.BoxGeometry(2.55, 0.08, 1.75);
    const lipMat = new THREE.MeshStandardMaterial({
      color: 0x1A1A1E,
      roughness: 0.4
    });
    const lipMesh = new THREE.Mesh(lipGeo, lipMat);
    lipMesh.position.y = 0.38;
    group.add(lipMesh);

    // Exploded Layer 1: Branded Kraft Paper Wrap Sleeve
    const sleeveGeo = new THREE.BoxGeometry(1.2, 0.79, 1.64);
    const sleeveMat = new THREE.MeshStandardMaterial({
      map: sleeveTexture,
      roughness: 0.75,
      metalness: 0.02,
      wireframe: this.isWireframe
    });
    const sleeveMesh = new THREE.Mesh(sleeveGeo, sleeveMat);
    sleeveMesh.position.set(0, 0, 0);
    sleeveMesh.castShadow = true;
    group.add(sleeveMesh);

    // Exploded Layer 2: Transparent Anti-Fog Snap Lid
    const lidGroup = new THREE.Group();
    lidGroup.name = 'exploded_layer';
    lidGroup.position.set(0, 0.48, 0);

    const lidGeo = new THREE.BoxGeometry(2.48, 0.18, 1.68);
    const lidMat = new THREE.MeshPhysicalMaterial({
      color: 0xFFFFFF,
      roughness: 0.15,
      transmission: 0.88,
      thickness: 0.12,
      opacity: 0.85,
      transparent: true,
      ior: 1.48
    });
    const lidMesh = new THREE.Mesh(lidGeo, lidMat);
    lidMesh.castShadow = true;
    lidGroup.add(lidMesh);

    group.add(lidGroup);
    this.explodedPart = lidGroup;
    this.explodedPartBasePos = new THREE.Vector3(0, 0.48, 0);
    this.explodedPartTargetPos = new THREE.Vector3(0, 1.5, 0);
  }

  /**
   * 4. TISSUES & NAPKINS MODEL: Stack of embossed 3-ply napkins with gold foil
   */
  buildTissueModel() {
    const group = this.currentMeshGroup;
    group.name = 'tissue_model';

    const tissueTexture = this.createBrandingTexture('tissue');

    // Napkin Stack (Box: width 2.0, depth 2.0, height 0.6)
    const stackGeo = new THREE.BoxGeometry(2.0, 0.55, 2.0, 16, 8, 16);
    const stackMat = new THREE.MeshStandardMaterial({
      map: tissueTexture,
      roughness: 0.85,
      metalness: 0.05,
      wireframe: this.isWireframe
    });
    const stackMesh = new THREE.Mesh(stackGeo, stackMat);
    stackMesh.castShadow = true;
    stackMesh.receiveShadow = true;
    group.add(stackMesh);
    this.mainBodyMesh = stackMesh;

    // Edge Waffle Embossing Border
    const waffleGeo = new THREE.RingGeometry(0.85, 0.98, 4);
    const waffleMat = new THREE.MeshStandardMaterial({
      color: 0xD4AF37,
      metalness: 0.65,
      roughness: 0.3,
      side: THREE.DoubleSide
    });
    const waffleMesh = new THREE.Mesh(waffleGeo, waffleMat);
    waffleMesh.rotation.x = -Math.PI / 2;
    waffleMesh.position.y = 0.28;
    group.add(waffleMesh);

    // Exploded View: Single Lifted Folded Napkin Leaf
    const leafGeo = new THREE.PlaneGeometry(1.95, 1.95);
    const leafMat = new THREE.MeshStandardMaterial({
      map: tissueTexture,
      roughness: 0.8,
      side: THREE.DoubleSide
    });
    const leafMesh = new THREE.Mesh(leafGeo, leafMat);
    leafMesh.rotation.x = -Math.PI / 2.2;
    leafMesh.position.set(0, 0.35, 0);
    group.add(leafMesh);

    this.explodedPart = leafMesh;
    this.explodedPartBasePos = new THREE.Vector3(0, 0.35, 0);
    this.explodedPartTargetPos = new THREE.Vector3(0, 1.3, 0.2);
  }

  /**
   * Omnidirectional Pointer & Touch Handling with inertia damping
   */
  bindPointerEvents() {
    const el = this.canvas;

    // Desktop Pointer Down
    el.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.prevPointerPos = { x: e.clientX, y: e.clientY };
      this.velocity = { x: 0, y: 0 };
      el.setPointerCapture(e.pointerId);
    }, { passive: false });

    // Pointer Move (Omnidirectional vector following)
    el.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;

      const deltaX = e.clientX - this.prevPointerPos.x;
      const deltaY = e.clientY - this.prevPointerPos.y;

      const rotSpeed = this.options.rotationSensitivity;
      this.velocity.y = deltaX * rotSpeed;
      this.velocity.x = deltaY * rotSpeed;

      this.targetRotation.y += this.velocity.y;
      this.targetRotation.x += this.velocity.x;

      // Clamp vertical tilt to avoid gimbal inversion (-75 deg to +75 deg)
      this.targetRotation.x = Math.max(-1.3, Math.min(1.3, this.targetRotation.x));

      this.prevPointerPos = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    }, { passive: false });

    // Pointer Up
    const onPointerUp = (e) => {
      if (this.isDragging) {
        this.isDragging = false;
        try { el.releasePointerCapture(e.pointerId); } catch(err) {}
      }
    };
    el.addEventListener('pointerup', onPointerUp, { passive: false });
    el.addEventListener('pointercancel', onPointerUp, { passive: false });

    // Mouse Wheel Zoom
    el.addEventListener('wheel', (e) => {
      const zoomDelta = e.deltaY * this.options.zoomSensitivity;
      this.setZoomDelta(zoomDelta);
      e.preventDefault();
    }, { passive: false });

    // Mobile Multi-Touch Pinch-to-Zoom
    el.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        this.touchPinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }, { passive: false });

    el.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const distDelta = (this.touchPinchDist - currentDist) * 0.008;
        this.setZoomDelta(distDelta);
        this.touchPinchDist = currentDist;
        e.preventDefault();
      }
    }, { passive: false });
  }

  setZoomDelta(delta) {
    this.targetDistance = Math.max(
      this.options.minDistance,
      Math.min(this.options.maxDistance, this.targetDistance + delta)
    );
    if (this.options.onZoomUpdate) {
      const factor = (this.options.maxDistance - this.targetDistance) / (this.options.maxDistance - this.options.minDistance);
      this.options.onZoomUpdate(factor);
    }
  }

  setZoomFactor(factor0to1) {
    // 0 = farthest, 1 = closest
    const clamped = Math.max(0, Math.min(1, factor0to1));
    this.targetDistance = this.options.maxDistance - clamped * (this.options.maxDistance - this.options.minDistance);
  }

  toggleAutoRotate() {
    this.autoRotate = !this.autoRotate;
    return this.autoRotate;
  }

  toggleExplodedView() {
    this.isExploded = !this.isExploded;
    return this.isExploded;
  }

  toggleWireframe() {
    this.isWireframe = !this.isWireframe;
    if (this.currentMeshGroup) {
      this.currentMeshGroup.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.wireframe = this.isWireframe;
        }
      });
    }
    return this.isWireframe;
  }

  resetOrientation() {
    const cfg = window.DATA_CONFIG?.productMedia?.[this.currentCategory];
    if (cfg && cfg.defaultAngle) {
      this.targetRotation.x = cfg.defaultAngle.x;
      this.targetRotation.y = cfg.defaultAngle.y;
    } else {
      this.targetRotation.x = 0.15;
      this.targetRotation.y = -0.4;
    }
    this.targetDistance = this.options.maxDistance;
    if (this.options.onZoomUpdate) {
      this.options.onZoomUpdate(0);
    }
  }

  handleResize() {
    if (!this.canvas || !this.renderer || !this.camera) return;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  disposeObject(obj) {
    if (!obj) return;
    obj.traverse((child) => {
      if (child.isMesh) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    });
  }

  /**
   * 60fps Render Loop with Spring Physics & Inertia Damping
   */
  animate() {
    requestAnimationFrame(this.animate);

    // Handle auto-rotation
    if (this.autoRotate && !this.isDragging) {
      this.targetRotation.y += this.autoRotateSpeed;
    }

    // Apply inertia damping to rotation
    if (!this.isDragging) {
      this.velocity.x *= 0.94;
      this.velocity.y *= 0.94;
      this.targetRotation.x += this.velocity.x;
      this.targetRotation.y += this.velocity.y;
      this.targetRotation.x = Math.max(-1.3, Math.min(1.3, this.targetRotation.x));
    }

    // Smooth spherical rotation interpolation
    const damp = this.options.dampingFactor;
    this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * damp;
    this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * damp;

    if (this.productRoot) {
      this.productRoot.rotation.x = this.currentRotation.x;
      this.productRoot.rotation.y = this.currentRotation.y;
    }

    // Smooth zoom interpolation
    this.currentDistance += (this.targetDistance - this.currentDistance) * damp;
    if (this.camera) {
      this.camera.position.z = this.currentDistance;
    }

    // Exploded view animation interpolation
    if (this.explodedPart && this.explodedPartBasePos && this.explodedPartTargetPos) {
      const dest = this.isExploded ? this.explodedPartTargetPos : this.explodedPartBasePos;
      this.explodedPart.position.lerp(dest, 0.1);
    }

    // Fire telemetry readout callback
    if (this.options.onAngleUpdate) {
      const degX = (this.currentRotation.x * (180 / Math.PI)).toFixed(1);
      const degY = (this.currentRotation.y * (180 / Math.PI)).toFixed(1);
      const zoomRatio = (this.options.maxDistance / this.currentDistance).toFixed(2);
      this.options.onAngleUpdate(degX, degY, zoomRatio);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.Visualizer3D = Visualizer3D;
