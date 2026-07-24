import * as THREE from "three";

/** The page background. Fog is set to this exact value so scenes fade out. */
export const PAPER = "#f5f2ec";
export const INK = "#2b2e2a";
export const SAGE = "#9caf88";
export const SAGE_DEEP = "#7d9268";
export const SAND = "#e2d9c6";
export const CLAY = "#c8a68b";

/**
 * Three flat steps. MeshToonMaterial without a gradient map falls back to a
 * soft two-band ramp, which reads as cheap shading rather than as a choice.
 */
function createToonRamp() {
    const steps = new Uint8Array([90, 175, 255]);
    const ramp = new THREE.DataTexture(steps, steps.length, 1, THREE.RedFormat);

    ramp.minFilter = THREE.NearestFilter;
    ramp.magFilter = THREE.NearestFilter;
    ramp.generateMipmaps = false;
    ramp.needsUpdate = true;

    return ramp;
}

let ramp: THREE.DataTexture | null = null;

function getRamp() {
    if (!ramp) {
        ramp = createToonRamp();
    }

    return ramp;
}

const materials = new Map<string, THREE.MeshToonMaterial>();

/**
 * One material per colour, shared by every mesh and every scene: repeated
 * colours cost no extra shader program and no extra draw state.
 */
export function toonMaterial(color: string) {
    const cached = materials.get(color);

    if (cached) {
        return cached;
    }

    const material = new THREE.MeshToonMaterial({
        color: new THREE.Color(color),
        gradientMap: getRamp(),
    });

    materials.set(color, material);

    return material;
}

/**
 * Unit primitives, scaled per mesh. Assembling characters out of these keeps
 * the geometry count flat no matter how many parts a character has.
 */
export const geometries = {
    box: new THREE.BoxGeometry(1, 1, 1),
    sphere: new THREE.SphereGeometry(0.5, 16, 12),
    capsule: new THREE.CapsuleGeometry(0.5, 1, 4, 12),
    cylinder: new THREE.CylinderGeometry(0.5, 0.5, 1, 14),
    cone: new THREE.ConeGeometry(0.5, 1, 12),
    plane: new THREE.PlaneGeometry(1, 1),
};

/**
 * Tabby banding painted straight into the coat, so the stripes are flush with
 * the body instead of raised geometry. Bands run along the texture height,
 * which maps around the flanks of the horizontal body capsule.
 */
export function stripeTexture(base: string, stripe: string) {
    const width = 8;
    const height = 64;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (context) {
        context.fillStyle = base;
        context.fillRect(0, 0, width, height);
        context.fillStyle = stripe;

        for (let i = 0; i < 5; i += 1) {
            context.fillRect(0, 4 + i * 12, width, 6);
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;

    return texture;
}

let ballMap: THREE.CanvasTexture | null = null;

/** A muted padel green with the two white seams. */
export function padelBallTexture() {
    if (ballMap) {
        return ballMap;
    }

    const width = 128;
    const height = 64;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (context) {
        context.fillStyle = "#9bb36e";
        context.fillRect(0, 0, width, height);

        context.strokeStyle = "#f4f6ee";
        context.lineWidth = 5;
        context.lineCap = "round";

        // Two interlocking seams, half a period apart.
        for (const phase of [0, Math.PI]) {
            context.beginPath();
            for (let x = 0; x <= width; x += 2) {
                const y = height / 2 + Math.sin((x / width) * Math.PI * 2 + phase) * (height * 0.28);
                x === 0 ? context.moveTo(x, y) : context.lineTo(x, y);
            }
            context.stroke();
        }
    }

    ballMap = new THREE.CanvasTexture(canvas);

    return ballMap;
}

let shadowMap: THREE.CanvasTexture | null = null;

/** Radial falloff used as a one-draw stand-in for real contact shadows. */
export function shadowTexture() {
    if (shadowMap) {
        return shadowMap;
    }

    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext("2d");

    if (context) {
        const gradient = context.createRadialGradient(
            size / 2,
            size / 2,
            0,
            size / 2,
            size / 2,
            size / 2
        );

        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.55, "rgba(255, 255, 255, 0.45)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        context.fillStyle = gradient;
        context.fillRect(0, 0, size, size);
    }

    shadowMap = new THREE.CanvasTexture(canvas);

    return shadowMap;
}
