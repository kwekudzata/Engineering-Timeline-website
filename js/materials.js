// materials.js — Mesh + wireframe material system
import * as THREE from 'three';

// Era-specific color palettes
const ERA_PALETTES = {
    wheel: {
        primary: 0x8B6914,   // warm bronze
        secondary: 0x5C4A1E,   // dark wood
        accent: 0xA0782C,   // light bronze
        metal: 0x6B5B3A    // aged metal
    },
    steam: {
        primary: 0x4A4A4A,   // industrial iron
        secondary: 0x2E2E2E,   // dark steel
        accent: 0x8B4513,   // copper accent
        metal: 0x696969    // cast iron
    },
    electricity: {
        primary: 0xB87333,   // copper
        secondary: 0x4A4A4A,   // steel housing
        accent: 0xDAA520,   // gold brass
        metal: 0x2F4F4F    // dark slate
    },
    internet: {
        primary: 0x3A3A4A,   // cool gunmetal
        secondary: 0x1A1A2E,   // dark navy
        accent: 0x00FF88,   // LED green
        metal: 0x555566    // brushed aluminum
    },
    ai: {
        primary: 0x1A1A2E,   // deep navy
        secondary: 0x0A0A1A,   // near-black
        accent: 0x2563EB,   // electric blue
        metal: 0x333344    // silicon gray
    }
};

export function createBaseMaterial(color, opts = {}) {
    return new THREE.MeshStandardMaterial({
        color: color,
        metalness: opts.metalness ?? 0.7,
        roughness: opts.roughness ?? 0.3,
        envMapIntensity: 1.0,
        ...opts
    });
}

export function createWireframeMaterial(opacity = 0.3) {
    return new THREE.MeshBasicMaterial({
        color: 0x2563EB,
        wireframe: true,
        transparent: true,
        opacity: opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
}

export function createEmissiveMaterial(color = 0x2563EB, intensity = 1.5) {
    return new THREE.MeshStandardMaterial({
        color: 0x000000,
        emissive: color,
        emissiveIntensity: intensity,
        metalness: 0.0,
        roughness: 1.0,
        transparent: true,
        opacity: 0.8
    });
}

export function createGlassMaterial() {
    return new THREE.MeshPhysicalMaterial({
        color: 0x88ccff,
        metalness: 0.0,
        roughness: 0.0,
        transmission: 0.9,
        thickness: 0.5,
        transparent: true,
        opacity: 0.3
    });
}

export function getEraPalette(era) {
    return ERA_PALETTES[era] || ERA_PALETTES.ai;
}

// Apply wireframe overlay clone to a mesh
export function addWireframeOverlay(mesh, opacity = 0.2) {
    const wireframe = mesh.clone();
    wireframe.material = createWireframeMaterial(opacity);
    wireframe.scale.multiplyScalar(1.002); // slight offset to prevent z-fighting
    wireframe.raycast = () => { };
    mesh.parent.add(wireframe);
    return wireframe;
}
