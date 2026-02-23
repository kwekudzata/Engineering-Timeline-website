// scrollController.js — GSAP ScrollTrigger integration & section detection
import { setupExplodedView, updateExplodedView, setGroupOpacity } from './animation.js';

let activeSection = 'hero';
let sectionModels = {};
let scrollTriggers = [];
let onSectionChangeCallback = null;

const ERA_SECTIONS = ['wheel', 'steam', 'electricity', 'internet', 'ai'];

export function setOnSectionChange(callback) {
    onSectionChangeCallback = callback;
}

export function registerModel(sectionId, modelData) {
    sectionModels[sectionId] = modelData;
    // Initialize exploded view positions
    setupExplodedView(modelData.parts);
}

export function getActiveSection() {
    return activeSection;
}

export function initScrollTriggers() {
    // Register GSAP ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Hero section — detect when leaving
    ScrollTrigger.create({
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        onEnter: () => setActiveSection('hero'),
        onEnterBack: () => setActiveSection('hero')
    });

    // Era sections — each gets a ScrollTrigger that maps progress to explode animation
    ERA_SECTIONS.forEach(sectionId => {
        const sectionEl = document.getElementById(sectionId);
        if (!sectionEl) return;

        const st = ScrollTrigger.create({
            trigger: sectionEl,
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 0.5,
            onEnter: () => setActiveSection(sectionId),
            onEnterBack: () => setActiveSection(sectionId),
            onUpdate: (self) => {
                // Map scroll progress to exploded view
                const model = sectionModels[sectionId];
                if (model && model.parts) {
                    updateExplodedView(model.parts, self.progress);
                }
            }
        });

        scrollTriggers.push(st);
    });
}

function setActiveSection(sectionId) {
    if (activeSection === sectionId) return;
    const prevSection = activeSection;
    activeSection = sectionId;

    if (onSectionChangeCallback) {
        onSectionChangeCallback(sectionId, prevSection);
    }
}

export function dispose() {
    scrollTriggers.forEach(st => st.kill());
    scrollTriggers = [];
    sectionModels = {};
}
