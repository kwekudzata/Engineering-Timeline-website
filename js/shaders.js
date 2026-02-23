// shaders.js — Vertex displacement pulse & holographic aura
import * as THREE from 'three';

// Vertex displacement pulse shader
const pulseVertexShader = `
    uniform float uTime;
    uniform float uAmplitude;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        
        // Subtle pulse along normals
        float pulse = sin(uTime * 2.0 + position.y * 3.0) * uAmplitude;
        vec3 displaced = position + normal * pulse;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
    }
`;

const pulseFragmentShader = `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
        // Edge glow based on view angle
        float edgeFactor = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
        edgeFactor = pow(edgeFactor, 2.0);
        
        // Traveling pulse wave
        float wave = sin(vPosition.y * 4.0 - uTime * 3.0) * 0.5 + 0.5;
        
        float alpha = edgeFactor * 0.4 * wave;
        vec3 color = uColor * (0.5 + edgeFactor * 0.5);
        
        gl_FragColor = vec4(color, alpha);
    }
`;

export function createPulseShaderMaterial() {
    return new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uAmplitude: { value: 0.02 },
            uColor: { value: new THREE.Color(0x2563EB) }
        },
        vertexShader: pulseVertexShader,
        fragmentShader: pulseFragmentShader,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
    });
}

// Holographic rotating wireframe aura
export function createHolographicAura(radius = 3.0) {
    const geometry = new THREE.IcosahedronGeometry(radius, 1);
    const material = new THREE.MeshBasicMaterial({
        color: 0x2563EB,
        wireframe: true,
        transparent: true,
        opacity: 0.06,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = -1;
    return mesh;
}

export function updateShaderTime(material, time) {
    if (material.uniforms && material.uniforms.uTime) {
        material.uniforms.uTime.value = time;
    }
}
