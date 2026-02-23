// lighting.js — Cinematic physically-based lighting
import * as THREE from 'three';

export function setupLighting(scene) {
    // Ambient — very low base
    const ambient = new THREE.AmbientLight(0x111122, 0.3);
    scene.add(ambient);

    // Hemisphere — sky/ground subtle fill
    const hemi = new THREE.HemisphereLight(0x1a1a3e, 0x0a0a0a, 0.4);
    scene.add(hemi);

    // Key light — main directional
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.camera.left = -10;
    keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    scene.add(keyLight);

    // Fill light — opposite side, softer
    const fillLight = new THREE.DirectionalLight(0x4466aa, 0.6);
    fillLight.position.set(-5, 3, -3);
    scene.add(fillLight);

    // Rim light — back-left
    const rimLeft = new THREE.SpotLight(0x2563EB, 2.0, 30, Math.PI / 6, 0.5, 1);
    rimLeft.position.set(-6, 4, -5);
    rimLeft.target.position.set(0, 0, 0);
    scene.add(rimLeft);
    scene.add(rimLeft.target);

    // Rim light — back-right
    const rimRight = new THREE.SpotLight(0x2563EB, 2.0, 30, Math.PI / 6, 0.5, 1);
    rimRight.position.set(6, 4, -5);
    rimRight.target.position.set(0, 0, 0);
    scene.add(rimRight);
    scene.add(rimRight.target);

    // Subtle point light under model for floor glow
    const underGlow = new THREE.PointLight(0x2563EB, 0.5, 10);
    underGlow.position.set(0, -2, 0);
    scene.add(underGlow);
}
