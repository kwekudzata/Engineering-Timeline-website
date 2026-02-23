// animation.js — Exploded view animation logic
import * as THREE from 'three';

/**
 * Set up exploded view offsets for a model's parts.
 * Each part has: { mesh, originalPos, explodeDir }
 * explodeDir is the direction + magnitude vector for full explosion.
 */
export function setupExplodedView(parts) {
    parts.forEach(part => {
        // Ensure we have the original position stored
        if (!part.originalPos) {
            part.originalPos = part.mesh.position.clone();
        }
        // Compute the target exploded position
        part.explodedPos = part.originalPos.clone().add(part.explodeDir);
    });
}

/**
 * Update exploded view based on scroll progress (0 = assembled, 1 = exploded).
 * Pure translation — no scaling, morphing, or distortion.
 */
export function updateExplodedView(parts, progress) {
    // Clamp progress
    const t = Math.max(0, Math.min(1, progress));

    // Apply smooth easing — cubic ease in-out
    const eased = t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;

    parts.forEach(part => {
        if (!part.mesh || !part.originalPos || !part.explodedPos) return;

        // Lerp between assembled and exploded positions
        part.mesh.position.lerpVectors(part.originalPos, part.explodedPos, eased);
    });
}

/**
 * Smooth opacity transition for model groups
 */
export function setGroupOpacity(group, opacity) {
    group.traverse(child => {
        if (child.isMesh && child.material) {
            if (Array.isArray(child.material)) {
                child.material.forEach(mat => {
                    mat.transparent = true;
                    mat.opacity = opacity;
                });
            } else {
                child.material.transparent = true;
                child.material.opacity = opacity;
            }
        }
        if (child.isLineSegments && child.material) {
            child.material.transparent = true;
            child.material.opacity = opacity;
        }
    });
}
