// models.js — Procedural 3D mechanical model generation
import * as THREE from 'three';
import { createBaseMaterial, createEmissiveMaterial, getEraPalette, addWireframeOverlay } from './materials.js';

// ─── Helper ───
function makePart(geometry, material, position, name) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = name;
    return mesh;
}

// ═══════════════════════════════════════════
// THE WHEEL — ~3500 BC
// ═══════════════════════════════════════════
export function createWheelModel() {
    const group = new THREE.Group();
    const parts = [];
    const pal = getEraPalette('wheel');

    // Outer rim (torus)
    const rimGeo = new THREE.TorusGeometry(2, 0.15, 16, 48);
    const rimMat = createBaseMaterial(pal.primary, { metalness: 0.4, roughness: 0.6 });
    const rim = makePart(rimGeo, rimMat, new THREE.Vector3(0, 0, 0), 'rim');
    group.add(rim);
    parts.push({ mesh: rim, originalPos: rim.position.clone(), explodeDir: new THREE.Vector3(0, 0, 0.8) });

    // Inner rim band
    const innerRimGeo = new THREE.TorusGeometry(1.6, 0.08, 12, 48);
    const innerRim = makePart(innerRimGeo, createBaseMaterial(pal.metal), new THREE.Vector3(0, 0, 0), 'innerRim');
    group.add(innerRim);
    parts.push({ mesh: innerRim, originalPos: innerRim.position.clone(), explodeDir: new THREE.Vector3(0, 0, 0.5) });

    // Hub (cylinder)
    const hubGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 24);
    const hubMat = createBaseMaterial(pal.metal, { metalness: 0.8, roughness: 0.2 });
    const hub = makePart(hubGeo, hubMat, new THREE.Vector3(0, 0, 0), 'hub');
    hub.rotation.x = Math.PI / 2;
    group.add(hub);
    parts.push({ mesh: hub, originalPos: hub.position.clone(), explodeDir: new THREE.Vector3(0, 0, -1.2) });

    // Hub cap (front)
    const capGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.08, 24);
    const cap = makePart(capGeo, createBaseMaterial(pal.accent), new THREE.Vector3(0, 0, 0.18), 'hubCap');
    cap.rotation.x = Math.PI / 2;
    group.add(cap);
    parts.push({ mesh: cap, originalPos: cap.position.clone(), explodeDir: new THREE.Vector3(0, 0, -1.8) });

    // Spokes (8)
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const spokeGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.6, 8);
        const spoke = makePart(spokeGeo, createBaseMaterial(pal.secondary, { metalness: 0.3, roughness: 0.7 }),
            new THREE.Vector3(Math.cos(angle) * 0.9, Math.sin(angle) * 0.9, 0), `spoke_${i}`);
        spoke.rotation.z = angle + Math.PI / 2;
        group.add(spoke);
        parts.push({
            mesh: spoke,
            originalPos: spoke.position.clone(),
            explodeDir: new THREE.Vector3(Math.cos(angle) * 0.6, Math.sin(angle) * 0.6, 0)
        });
    }

    // Axle
    const axleGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 12);
    const axle = makePart(axleGeo, createBaseMaterial(pal.metal, { metalness: 0.9, roughness: 0.1 }),
        new THREE.Vector3(0, 0, 0), 'axle');
    axle.rotation.x = Math.PI / 2;
    group.add(axle);
    parts.push({ mesh: axle, originalPos: axle.position.clone(), explodeDir: new THREE.Vector3(0, 0, -2.0) });

    // Metal bands on rim (decorative rings)
    for (let i = 0; i < 4; i++) {
        const bandGeo = new THREE.TorusGeometry(2, 0.03, 8, 48);
        const band = makePart(bandGeo, createEmissiveMaterial(0x2563EB, 0.6),
            new THREE.Vector3(0, 0, (i - 1.5) * 0.06), `band_${i}`);
        group.add(band);
        parts.push({ mesh: band, originalPos: band.position.clone(), explodeDir: new THREE.Vector3(0, 0, 0.3 * (i - 1.5)) });
    }

    // Add wireframe overlay to key parts
    [rim, hub, innerRim].forEach(m => addWireframeOverlay(m, 0.15));

    group.rotation.x = 0.1; // slight tilt for depth
    return { group, parts };
}


// ═══════════════════════════════════════════
// STEAM ENGINE — 1712
// ═══════════════════════════════════════════
export function createSteamEngineModel() {
    const group = new THREE.Group();
    const parts = [];
    const pal = getEraPalette('steam');

    // Main boiler (horizontal cylinder)
    const boilerGeo = new THREE.CylinderGeometry(0.8, 0.8, 3.0, 32);
    const boilerMat = createBaseMaterial(pal.primary, { metalness: 0.8, roughness: 0.3 });
    const boiler = makePart(boilerGeo, boilerMat, new THREE.Vector3(0, 0.5, 0), 'boiler');
    boiler.rotation.z = Math.PI / 2;
    group.add(boiler);
    parts.push({ mesh: boiler, originalPos: boiler.position.clone(), explodeDir: new THREE.Vector3(0, 1.5, 0) });

    // Boiler end caps
    for (let side = -1; side <= 1; side += 2) {
        const capGeo = new THREE.SphereGeometry(0.8, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const cap = makePart(capGeo, createBaseMaterial(pal.metal),
            new THREE.Vector3(side * 1.5, 0.5, 0), `boilerCap_${side}`);
        cap.rotation.z = side > 0 ? -Math.PI / 2 : Math.PI / 2;
        group.add(cap);
        parts.push({ mesh: cap, originalPos: cap.position.clone(), explodeDir: new THREE.Vector3(side * 1.2, 0.8, 0) });
    }

    // Smokestack
    const stackGeo = new THREE.CylinderGeometry(0.15, 0.2, 1.5, 16);
    const stack = makePart(stackGeo, createBaseMaterial(pal.secondary), new THREE.Vector3(-0.5, 1.7, 0), 'smokestack');
    group.add(stack);
    parts.push({ mesh: stack, originalPos: stack.position.clone(), explodeDir: new THREE.Vector3(0, 2.0, 0) });

    // Stack top (flared)
    const stackTopGeo = new THREE.CylinderGeometry(0.25, 0.15, 0.2, 16);
    const stackTop = makePart(stackTopGeo, createBaseMaterial(pal.secondary), new THREE.Vector3(-0.5, 2.55, 0), 'stackTop');
    group.add(stackTop);
    parts.push({ mesh: stackTop, originalPos: stackTop.position.clone(), explodeDir: new THREE.Vector3(0, 2.5, 0) });

    // Piston cylinder
    const pistonCylGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 20);
    const pistonCyl = makePart(pistonCylGeo, createBaseMaterial(pal.accent), new THREE.Vector3(1.0, -0.5, 0), 'pistonCylinder');
    pistonCyl.rotation.z = Math.PI / 2;
    group.add(pistonCyl);
    parts.push({ mesh: pistonCyl, originalPos: pistonCyl.position.clone(), explodeDir: new THREE.Vector3(1.5, -1.0, 0) });

    // Piston rod
    const rodGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.8, 8);
    const rod = makePart(rodGeo, createBaseMaterial(pal.metal, { metalness: 0.9 }), new THREE.Vector3(1.8, -0.5, 0), 'pistonRod');
    rod.rotation.z = Math.PI / 2;
    group.add(rod);
    parts.push({ mesh: rod, originalPos: rod.position.clone(), explodeDir: new THREE.Vector3(2.0, -0.5, 0) });

    // Flywheel
    const flywheelGeo = new THREE.TorusGeometry(0.7, 0.1, 16, 32);
    const flywheel = makePart(flywheelGeo, createBaseMaterial(pal.metal, { metalness: 0.85 }),
        new THREE.Vector3(2.2, -0.5, 0), 'flywheel');
    flywheel.rotation.y = Math.PI / 2;
    group.add(flywheel);
    parts.push({ mesh: flywheel, originalPos: flywheel.position.clone(), explodeDir: new THREE.Vector3(2.5, 0, 1.0) });

    // Flywheel spokes
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const fSpokeGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.7, 6);
        const fSpoke = makePart(fSpokeGeo, createBaseMaterial(pal.metal),
            new THREE.Vector3(2.2, -0.5 + Math.sin(angle) * 0.35, Math.cos(angle) * 0.35), `fSpoke_${i}`);
        fSpoke.rotation.x = angle;
        group.add(fSpoke);
        parts.push({ mesh: fSpoke, originalPos: fSpoke.position.clone(), explodeDir: new THREE.Vector3(2.5, Math.sin(angle) * 0.4, Math.cos(angle) * 0.4) });
    }

    // Base frame
    const baseGeo = new THREE.BoxGeometry(4.0, 0.15, 1.2);
    const base = makePart(baseGeo, createBaseMaterial(pal.secondary, { metalness: 0.6 }),
        new THREE.Vector3(0.3, -1.2, 0), 'baseFrame');
    group.add(base);
    parts.push({ mesh: base, originalPos: base.position.clone(), explodeDir: new THREE.Vector3(0, -1.5, 0) });

    // Support legs
    for (let x = -1; x <= 1; x += 2) {
        const legGeo = new THREE.BoxGeometry(0.15, 0.8, 0.15);
        const leg = makePart(legGeo, createBaseMaterial(pal.secondary),
            new THREE.Vector3(x * 1.5, -1.6, 0), `leg_${x}`);
        group.add(leg);
        parts.push({ mesh: leg, originalPos: leg.position.clone(), explodeDir: new THREE.Vector3(x * 0.5, -2.0, 0) });
    }

    // Pressure gauge (small)
    const gaugeGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const gauge = makePart(gaugeGeo, createEmissiveMaterial(0x2563EB, 1.0), new THREE.Vector3(0.3, 1.3, 0.75), 'gauge');
    group.add(gauge);
    parts.push({ mesh: gauge, originalPos: gauge.position.clone(), explodeDir: new THREE.Vector3(0, 0.5, 1.5) });

    [boiler, pistonCyl, flywheel, base].forEach(m => addWireframeOverlay(m, 0.12));

    group.position.y = 0.2;
    group.rotation.y = -0.3;
    return { group, parts };
}


// ═══════════════════════════════════════════
// ELECTRICITY — 1879
// ═══════════════════════════════════════════
export function createElectricityModel() {
    const group = new THREE.Group();
    const parts = [];
    const pal = getEraPalette('electricity');

    // Stator housing (outer cylinder)
    const statorGeo = new THREE.CylinderGeometry(1.3, 1.3, 1.8, 32, 1, true);
    const statorMat = createBaseMaterial(pal.secondary, { metalness: 0.7, roughness: 0.4, side: THREE.DoubleSide });
    const stator = makePart(statorGeo, statorMat, new THREE.Vector3(0, 0, 0), 'stator');
    group.add(stator);
    parts.push({ mesh: stator, originalPos: stator.position.clone(), explodeDir: new THREE.Vector3(0, 0, 0) });

    // End plates
    for (let side = -1; side <= 1; side += 2) {
        const plateGeo = new THREE.CylinderGeometry(1.3, 1.3, 0.08, 32);
        const plate = makePart(plateGeo, createBaseMaterial(pal.metal),
            new THREE.Vector3(0, side * 0.94, 0), `endPlate_${side}`);
        group.add(plate);
        parts.push({ mesh: plate, originalPos: plate.position.clone(), explodeDir: new THREE.Vector3(0, side * 1.8, 0) });
    }

    // Rotor core
    const rotorGeo = new THREE.CylinderGeometry(0.5, 0.5, 2.5, 20);
    const rotor = makePart(rotorGeo, createBaseMaterial(pal.primary, { metalness: 0.9, roughness: 0.15 }),
        new THREE.Vector3(0, 0, 0), 'rotor');
    group.add(rotor);
    parts.push({ mesh: rotor, originalPos: rotor.position.clone(), explodeDir: new THREE.Vector3(0, 0, 2.0) });

    // Rotor shaft
    const shaftGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.5, 12);
    const shaft = makePart(shaftGeo, createBaseMaterial(pal.metal, { metalness: 0.95 }),
        new THREE.Vector3(0, 0, 0), 'shaft');
    group.add(shaft);
    parts.push({ mesh: shaft, originalPos: shaft.position.clone(), explodeDir: new THREE.Vector3(0, 0, 2.5) });

    // Copper coils (torus knots around stator)
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const coilGeo = new THREE.TorusGeometry(0.2, 0.06, 12, 24);
        const coil = makePart(coilGeo, createBaseMaterial(pal.primary, { metalness: 0.95, roughness: 0.1 }),
            new THREE.Vector3(Math.cos(angle) * 0.9, 0, Math.sin(angle) * 0.9), `coil_${i}`);
        coil.rotation.y = angle;
        coil.rotation.x = Math.PI / 2;
        group.add(coil);
        parts.push({
            mesh: coil,
            originalPos: coil.position.clone(),
            explodeDir: new THREE.Vector3(Math.cos(angle) * 1.5, 0, Math.sin(angle) * 1.5)
        });
    }

    // Commutator rings
    for (let i = 0; i < 3; i++) {
        const ringGeo = new THREE.TorusGeometry(0.55, 0.03, 8, 32);
        const ring = makePart(ringGeo, createBaseMaterial(pal.accent),
            new THREE.Vector3(0, 1.3 + i * 0.12, 0), `commRing_${i}`);
        group.add(ring);
        parts.push({ mesh: ring, originalPos: ring.position.clone(), explodeDir: new THREE.Vector3(0, 2.0 + i * 0.3, 0) });
    }

    // Wire connectors (emissive)
    for (let side = -1; side <= 1; side += 2) {
        const wireGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.5, 8);
        const wire = makePart(wireGeo, createEmissiveMaterial(0x2563EB, 2.0),
            new THREE.Vector3(side * 1.0, -0.8, 0), `wire_${side}`);
        wire.rotation.z = side * 0.3;
        group.add(wire);
        parts.push({ mesh: wire, originalPos: wire.position.clone(), explodeDir: new THREE.Vector3(side * 2.0, -1.5, 0) });
    }

    // Base mount
    const mountGeo = new THREE.BoxGeometry(2.0, 0.15, 1.5);
    const mount = makePart(mountGeo, createBaseMaterial(pal.metal, { metalness: 0.5 }),
        new THREE.Vector3(0, -1.6, 0), 'baseMounting');
    group.add(mount);
    parts.push({ mesh: mount, originalPos: mount.position.clone(), explodeDir: new THREE.Vector3(0, -2.0, 0) });

    [stator, rotor, mount].forEach(m => addWireframeOverlay(m, 0.12));

    group.rotation.x = 0.3;
    group.rotation.y = -0.4;
    return { group, parts };
}


// ═══════════════════════════════════════════
// THE INTERNET — 1969
// ═══════════════════════════════════════════
export function createInternetModel() {
    const group = new THREE.Group();
    const parts = [];
    const pal = getEraPalette('internet');

    // Main rack frame
    const rackGeo = new THREE.BoxGeometry(2.0, 3.5, 0.8);
    const rackEdges = new THREE.EdgesGeometry(rackGeo);
    const rackLine = new THREE.LineSegments(rackEdges, new THREE.LineBasicMaterial({
        color: pal.metal, transparent: true, opacity: 0.5
    }));
    rackLine.position.set(0, 0, 0);
    rackLine.name = 'rackFrame';
    group.add(rackLine);

    // Server units (stacked boxes)
    for (let i = 0; i < 6; i++) {
        const unitGeo = new THREE.BoxGeometry(1.8, 0.35, 0.7);
        const unitMat = createBaseMaterial(pal.primary, { metalness: 0.6, roughness: 0.4 });
        const unit = makePart(unitGeo, unitMat, new THREE.Vector3(0, -1.3 + i * 0.5, 0), `server_${i}`);
        group.add(unit);
        parts.push({
            mesh: unit,
            originalPos: unit.position.clone(),
            explodeDir: new THREE.Vector3((i % 2 === 0 ? 1 : -1) * 0.8, (i - 2.5) * 0.4, 0.5)
        });

        // LED indicators per unit
        for (let j = 0; j < 4; j++) {
            const ledGeo = new THREE.SphereGeometry(0.025, 8, 8);
            const ledColor = j === 0 ? pal.accent : 0x2563EB;
            const led = makePart(ledGeo, createEmissiveMaterial(ledColor, 3.0),
                new THREE.Vector3(-0.7 + j * 0.15, -1.3 + i * 0.5, 0.36), `led_${i}_${j}`);
            group.add(led);
            parts.push({
                mesh: led,
                originalPos: led.position.clone(),
                explodeDir: new THREE.Vector3((i % 2 === 0 ? 1 : -1) * 0.8, (i - 2.5) * 0.4, 0.8)
            });
        }
    }

    // Network cables (vertical)
    for (let side = -1; side <= 1; side += 2) {
        const cableGeo = new THREE.CylinderGeometry(0.02, 0.02, 3.0, 8);
        const cable = makePart(cableGeo, createEmissiveMaterial(0x2563EB, 1.5),
            new THREE.Vector3(side * 0.85, 0, -0.35), `cable_${side}`);
        group.add(cable);
        parts.push({ mesh: cable, originalPos: cable.position.clone(), explodeDir: new THREE.Vector3(side * 1.5, 0, -1.0) });
    }

    // Horizontal data bus lines
    for (let i = 0; i < 3; i++) {
        const busGeo = new THREE.BoxGeometry(2.2, 0.015, 0.015);
        const bus = makePart(busGeo, createEmissiveMaterial(0x2563EB, 2.0),
            new THREE.Vector3(0, -0.8 + i * 0.8, 0.36), `bus_${i}`);
        group.add(bus);
        parts.push({ mesh: bus, originalPos: bus.position.clone(), explodeDir: new THREE.Vector3(0, (i - 1) * 0.8, 1.0) });
    }

    // Cooling fans (back)
    for (let i = 0; i < 2; i++) {
        const fanGeo = new THREE.RingGeometry(0.15, 0.25, 16);
        const fanMat = createBaseMaterial(pal.metal, { metalness: 0.5 });
        const fan = makePart(fanGeo, fanMat, new THREE.Vector3(-0.5 + i * 1.0, 0.8, -0.41), `fan_${i}`);
        group.add(fan);
        parts.push({ mesh: fan, originalPos: fan.position.clone(), explodeDir: new THREE.Vector3(0, 0, -1.5) });
    }

    // Side panels
    for (let side = -1; side <= 1; side += 2) {
        const panelGeo = new THREE.PlaneGeometry(0.8, 3.5);
        const panelMat = createBaseMaterial(pal.secondary, { metalness: 0.4, roughness: 0.6, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
        const panel = makePart(panelGeo, panelMat, new THREE.Vector3(side * 1.01, 0, 0), `sidePanel_${side}`);
        panel.rotation.y = Math.PI / 2;
        group.add(panel);
        parts.push({ mesh: panel, originalPos: panel.position.clone(), explodeDir: new THREE.Vector3(side * 2.0, 0, 0) });
    }

    // Wire overlays on main units
    group.children.filter(c => c.name && c.name.startsWith('server_')).forEach(m => {
        if (m.isMesh) addWireframeOverlay(m, 0.1);
    });

    group.rotation.y = 0.3;
    return { group, parts };
}


// ═══════════════════════════════════════════
// AI — 2012
// ═══════════════════════════════════════════
export function createAIModel() {
    const group = new THREE.Group();
    const parts = [];
    const pal = getEraPalette('ai');

    // Layered silicon dies (stacked)
    const layerCount = 5;
    for (let i = 0; i < layerCount; i++) {
        const size = 2.0 - i * 0.15;
        const dieGeo = new THREE.BoxGeometry(size, 0.12, size);
        const dieMat = createBaseMaterial(pal.primary, {
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0x2563EB,
            emissiveIntensity: 0.05 + i * 0.08
        });
        const die = makePart(dieGeo, dieMat, new THREE.Vector3(0, -0.8 + i * 0.5, 0), `die_${i}`);
        group.add(die);
        parts.push({ mesh: die, originalPos: die.position.clone(), explodeDir: new THREE.Vector3(0, (i - 2) * 1.0, 0) });
    }

    // Heat spreader (top plate)
    const spreaderGeo = new THREE.BoxGeometry(2.2, 0.08, 2.2);
    const spreader = makePart(spreaderGeo, createBaseMaterial(pal.metal, { metalness: 0.95, roughness: 0.05 }),
        new THREE.Vector3(0, 1.5, 0), 'heatSpreader');
    group.add(spreader);
    parts.push({ mesh: spreader, originalPos: spreader.position.clone(), explodeDir: new THREE.Vector3(0, 2.5, 0) });

    // Circuit traces on layers (thin emissive lines)
    for (let layer = 0; layer < 3; layer++) {
        for (let j = 0; j < 6; j++) {
            const traceGeo = new THREE.BoxGeometry(1.6 - layer * 0.2, 0.01, 0.015);
            const trace = makePart(traceGeo, createEmissiveMaterial(0x2563EB, 2.0 + layer),
                new THREE.Vector3(0, -0.73 + layer * 0.5, -0.6 + j * 0.24), `trace_${layer}_${j}`);
            group.add(trace);
            parts.push({
                mesh: trace,
                originalPos: trace.position.clone(),
                explodeDir: new THREE.Vector3(0, (layer - 1) * 1.2, (j - 2.5) * 0.2)
            });
        }
    }

    // Neural network nodes (spheres at intersections)
    const nodePositions = [
        [-0.6, 0.2, -0.6], [0.6, 0.2, -0.6], [-0.6, 0.2, 0.6], [0.6, 0.2, 0.6],
        [0, 0.8, 0], [-0.4, 0.8, 0.4], [0.4, 0.8, -0.4],
        [0, 1.2, 0]
    ];

    nodePositions.forEach((pos, i) => {
        const nodeGeo = new THREE.SphereGeometry(0.06, 12, 12);
        const node = makePart(nodeGeo, createEmissiveMaterial(0x2563EB, 3.0),
            new THREE.Vector3(...pos), `neuralNode_${i}`);
        group.add(node);
        parts.push({
            mesh: node,
            originalPos: node.position.clone(),
            explodeDir: new THREE.Vector3(pos[0] * 1.5, pos[1] * 0.8, pos[2] * 1.5)
        });
    });

    // Neural connections (thin lines between nodes)
    const connections = [[0, 4], [1, 4], [2, 4], [3, 4], [4, 7], [5, 7], [6, 7], [1, 6], [2, 5]];
    connections.forEach(([a, b], i) => {
        const pA = new THREE.Vector3(...nodePositions[a]);
        const pB = new THREE.Vector3(...nodePositions[b]);
        const dir = pB.clone().sub(pA);
        const len = dir.length();
        const mid = pA.clone().add(pB).multiplyScalar(0.5);

        const connGeo = new THREE.CylinderGeometry(0.012, 0.012, len, 6);
        const conn = makePart(connGeo, createEmissiveMaterial(0x2563EB, 1.5), mid, `conn_${i}`);
        conn.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
        group.add(conn);
        parts.push({
            mesh: conn,
            originalPos: conn.position.clone(),
            explodeDir: new THREE.Vector3(mid.x * 0.5, mid.y * 0.5, mid.z * 0.5)
        });
    });

    // Pin grid array (bottom)
    for (let x = -4; x <= 4; x++) {
        for (let z = -4; z <= 4; z++) {
            if (Math.abs(x) < 2 && Math.abs(z) < 2) continue; // skip center
            const pinGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.3, 6);
            const pin = makePart(pinGeo, createBaseMaterial(pal.accent, { metalness: 0.95 }),
                new THREE.Vector3(x * 0.18, -1.1, z * 0.18), `pin_${x}_${z}`);
            group.add(pin);
            parts.push({
                mesh: pin,
                originalPos: pin.position.clone(),
                explodeDir: new THREE.Vector3(0, -1.5, 0)
            });
        }
    }

    // Substrate (PCB base)
    const pcbGeo = new THREE.BoxGeometry(2.4, 0.06, 2.4);
    const pcb = makePart(pcbGeo, createBaseMaterial(0x1a3a1a, { metalness: 0.3, roughness: 0.8 }),
        new THREE.Vector3(0, -0.95, 0), 'pcbSubstrate');
    group.add(pcb);
    parts.push({ mesh: pcb, originalPos: pcb.position.clone(), explodeDir: new THREE.Vector3(0, -2.0, 0) });

    // Wireframe overlays
    group.children.filter(c => c.name && c.name.startsWith('die_')).forEach(m => {
        if (m.isMesh) addWireframeOverlay(m, 0.15);
    });
    addWireframeOverlay(spreader, 0.1);
    addWireframeOverlay(pcb, 0.1);

    group.rotation.x = 0.4;
    group.rotation.y = -0.5;
    return { group, parts };
}


// ═══════════════════════════════════════════
// MODEL REGISTRY
// ═══════════════════════════════════════════
export const modelCreators = {
    wheel: createWheelModel,
    steam: createSteamEngineModel,
    electricity: createElectricityModel,
    internet: createInternetModel,
    ai: createAIModel
};
