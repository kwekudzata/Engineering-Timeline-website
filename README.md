# Engineering-Timeline


Engineering Timeline: From Wheel to AI

A high-end interactive 3D web experience that visually explores the evolution of engineering — from the first mechanical wheel to modern artificial intelligence systems.

This project replaces traditional static website images with real-time 3D rendered mechanical systems using Three.js. Each section features a precision exploded-view animation controlled by scroll interaction, creating a cinematic and educational journey through engineering history.

✨ Concept

Engineering has shaped civilization across eras:

The Wheel

Steam Engine

Electricity

Internet

Artificial Intelligence

Each innovation is represented by a detailed 3D mechanical model rendered in a dark, cinematic environment. As users scroll, models transition from fully assembled to perfectly aligned exploded views — symbolizing deeper understanding and technological progression.

🛠 Tech Stack

JavaScript (ES Modules)

Three.js for 3D rendering

GSAP + ScrollTrigger for scroll-based animation

Tailwind CSS for UI layout and responsiveness

GLTF / GLB models for mechanical assets

🎯 Key Features
1. Real-Time 3D Rendering

All mechanical objects are rendered live in the browser.

2. Exploded View Animation

Components separate along natural mechanical axes

Scroll-controlled precision animation

No morphing or geometry distortion

3. Mesh-Wireframe Fusion Aesthetic

Solid MeshStandardMaterial base

Electric blue (#2563EB) glowing wireframe overlay

Subtle technological pulse shader

4. Cinematic Environment

Pure black background (#000000)

Physically correct lighting

Rim highlights and controlled reflections

Floating particle grid + subtle floor grid

5. Fully Responsive

Desktop: Split layout (text + 3D canvas)

Mobile: Stacked layout with optimized camera framing

Reduced particle density on smaller screens

🧠 Architecture

The project uses a modular structure:

/src
  main.js
  scene.js
  lighting.js
  modelLoader.js
  animation.js
  scrollController.js
  materials.js
  shaders.js

Each timeline section dynamically loads its corresponding 3D model and binds scroll progress to its exploded state.

🎬 Experience Design

The camera remains completely static per section — creating a locked-off cinematic framing similar to luxury product showcases.

Motion is engineered to feel:

Precise

Frictionless

Synchronized

Clean

No jitter. No glitch. No distortion.

🚀 Purpose

This project was built to demonstrate:

Advanced frontend 3D rendering

Scroll-based animation systems

Interactive storytelling through engineering

High-end product visualization techniques

It blends historical innovation with modern web technology to create a portfolio-level interactive experience.
