// main.js — Entry point: scene init, environment, model management, render loop
import * as THREE from 'three';
import { init as initScene, resize, getScene, getCamera, getComposer } from './scene.js';
import { setupLighting } from './lighting.js';
import { modelCreators } from './models.js';
import { setupExplodedView, setGroupOpacity } from './animation.js';
import { initScrollTriggers, registerModel, setOnSectionChange, getActiveSection } from './scrollController.js';
import { createHolographicAura, createPulseShaderMaterial, updateShaderTime } from './shaders.js';

// ─── State ───
let container;
let models = {};
let currentModelId = null;
let particles;
let gridHelper;
let holographicAura;
let pulseMaterial;
let clock;

const ERA_ORDER = ['wheel', 'steam', 'electricity', 'internet', 'ai'];

// ─── Environment: Grid Floor ───
function createGridFloor(scene) {
    gridHelper = new THREE.GridHelper(30, 40, 0x111133, 0x0a0a1a);
    gridHelper.position.y = -2.5;
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Fade plane beneath grid
    const fadePlane = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 30),
        new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.7,
            depthWrite: false
        })
    );
    fadePlane.rotation.x = -Math.PI / 2;
    fadePlane.position.y = -2.51;
    scene.add(fadePlane);
}

// ─── Environment: Floating Particles ───
function createParticles(scene) {
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 300 : 800;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 30;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
        sizes[i] = Math.random() * 2 + 0.5;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        color: 0x2563EB,
        size: 0.04,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

// ─── Build All Models ───
function buildModels(scene) {
    ERA_ORDER.forEach(eraId => {
        const creator = modelCreators[eraId];
        if (!creator) return;

        const { group, parts } = creator();
        group.visible = false; // start hidden
        scene.add(group);

        models[eraId] = { group, parts };

        // Register with scroll controller
        registerModel(eraId, { parts });

        // Set up exploded positions
        setupExplodedView(parts);
    });
}

// ─── Model Visibility Switching ───
function showModel(eraId) {
    if (currentModelId === eraId) return;

    // Hide previous
    if (currentModelId && models[currentModelId]) {
        const prevModel = models[currentModelId];
        // Fade out with GSAP
        gsap.to({}, {
            duration: 0.3,
            onUpdate: function () {
                setGroupOpacity(prevModel.group, 1 - this.progress());
            },
            onComplete: () => {
                prevModel.group.visible = false;
                setGroupOpacity(prevModel.group, 1);
            }
        });
    }

    // Show new
    if (models[eraId]) {
        const newModel = models[eraId];
        setGroupOpacity(newModel.group, 0);
        newModel.group.visible = true;
        gsap.to({}, {
            duration: 0.4,
            delay: 0.1,
            onUpdate: function () {
                setGroupOpacity(newModel.group, this.progress());
            },
            onComplete: () => {
                setGroupOpacity(newModel.group, 1);
            }
        });
    }

    currentModelId = eraId;
}

function hideAllModels() {
    Object.values(models).forEach(m => {
        m.group.visible = false;
    });
    currentModelId = null;
}

// ─── Section Change Handler ───
function onSectionChange(newSection, prevSection) {
    if (ERA_ORDER.includes(newSection)) {
        showModel(newSection);
    } else {
        // Hero or unknown section — hide all 3D models
        hideAllModels();
    }
}

// ─── Animate Particles ───
function animateParticles(time) {
    if (!particles) return;
    const positions = particles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(time + positions[i] * 0.5) * 0.001;
    }
    particles.geometry.attributes.position.needsUpdate = true;
    particles.rotation.y = time * 0.02;
}

// ─── Animate Holographic Aura ───
function animateAura(time) {
    if (!holographicAura) return;
    holographicAura.rotation.x = time * 0.1;
    holographicAura.rotation.y = time * 0.15;
    holographicAura.rotation.z = time * 0.05;
}

// ─── Render Loop ───
function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // Animate environment
    animateParticles(time);
    animateAura(time);

    // Update shader uniforms
    if (pulseMaterial) {
        updateShaderTime(pulseMaterial, time);
    }

    // Subtle grid pulse
    if (gridHelper) {
        gridHelper.material.opacity = 0.2 + Math.sin(time * 0.5) * 0.05;
    }

    // Render with bloom
    const composer = getComposer();
    if (composer) {
        composer.render();
    }
}

// ─── Initialize Everything ───
function initApp() {
    container = document.getElementById('three-container');
    if (!container) {
        console.error('Three.js container #three-container not found');
        return;
    }

    clock = new THREE.Clock();

    // Init scene, camera, renderer, bloom
    initScene(container);
    const scene = getScene();

    // Lighting
    setupLighting(scene);

    // Environment
    createGridFloor(scene);
    createParticles(scene);

    // Holographic aura
    holographicAura = createHolographicAura(3.5);
    scene.add(holographicAura);

    // Build all models
    buildModels(scene);

    // Section change callback
    setOnSectionChange(onSectionChange);

    // Initialize GSAP ScrollTrigger bindings
    initScrollTriggers();

    // Show the first section model if already scrolled
    const activeSection = getActiveSection();
    if (ERA_ORDER.includes(activeSection)) {
        showModel(activeSection);
    }

    // Handle resize
    window.addEventListener('resize', onResize);
    onResize();

    // Start render loop
    animate();
}

function onResize() {
    if (!container) return;
    resize(container);

    // Refresh ScrollTrigger positions after layout changes
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
    }
}

// ─── Start ───
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
