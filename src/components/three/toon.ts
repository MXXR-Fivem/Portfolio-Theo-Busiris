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

/** Half-width and half-height of the racket head, in scene units. */
const HEAD_HALF_WIDTH = 0.205;
const HEAD_HALF_HEIGHT = 0.225;
/** Where the head stops being an ellipse and closes into the throat. */
const THROAT_Y = -0.155;
const THROAT_HALF_WIDTH =
    HEAD_HALF_WIDTH * Math.sqrt(1 - (THROAT_Y / HEAD_HALF_HEIGHT) ** 2);
/** Bottom of the throat, where the grip takes over. */
const NECK_Y = -0.3;
const NECK_HALF_WIDTH = 0.048;

/** Solid frame left around the perforated face. */
const FRAME_RIM = 0.03;
const FACE_HALF_WIDTH = HEAD_HALF_WIDTH - FRAME_RIM;
const FACE_HALF_HEIGHT = HEAD_HALF_HEIGHT - FRAME_RIM;
/** Bottom of the face; below it the frame stays solid down into the throat. */
const FACE_FLOOR = -0.135;

const HOLE_RADIUS = 0.0125;
const HOLE_SPACING = 0.043;
/** Solid rim left between the outermost holes and the frame. */
const HOLE_RIM = FRAME_RIM + HOLE_RADIUS + 0.008;
/** No round holes below this: the throat cut-out lives down there. */
const HOLE_FLOOR = -0.105;

const RACKET_DEPTH = 0.085;
/** The face is thinner than the frame and sunk a hair into it, so the two never
 *  meet on a shared surface and fight over it. */
const FACE_DEPTH = RACKET_DEPTH * 0.55;
const FACE_OVERLAP = 0.004;

/** The teardrop frame: an ellipse for the head, closing into the throat. */
function racketOutline() {
    const shape = new THREE.Shape();
    const start = Math.asin(THROAT_Y / HEAD_HALF_HEIGHT);
    const sweep = Math.PI - 2 * start;
    const steps = 44;

    shape.moveTo(THROAT_HALF_WIDTH, THROAT_Y);

    for (let i = 1; i <= steps; i += 1) {
        const angle = start + (i / steps) * sweep;
        shape.lineTo(
            HEAD_HALF_WIDTH * Math.cos(angle),
            HEAD_HALF_HEIGHT * Math.sin(angle)
        );
    }

    // Down the left shoulder into the neck, across the base, back up the right.
    const waist = (THROAT_Y + NECK_Y) / 2;
    shape.quadraticCurveTo(-THROAT_HALF_WIDTH * 0.86, waist, -NECK_HALF_WIDTH, NECK_Y);
    shape.lineTo(NECK_HALF_WIDTH, NECK_Y);
    shape.quadraticCurveTo(THROAT_HALF_WIDTH * 0.86, waist, THROAT_HALF_WIDTH, THROAT_Y);

    return shape;
}

/**
 * The face inside the frame: the same ellipse, inset by the frame width and cut
 * off flat where the throat begins. `grow` swells it so the panel buries its
 * own edge inside the frame instead of sitting flush against it.
 */
function facePoints(grow: number) {
    const halfWidth = FACE_HALF_WIDTH + grow;
    const halfHeight = FACE_HALF_HEIGHT + grow;
    const start = Math.asin(FACE_FLOOR / halfHeight);
    const sweep = Math.PI - 2 * start;
    const steps = 40;
    const points: [number, number][] = [];

    for (let i = 0; i <= steps; i += 1) {
        const angle = start + (i / steps) * sweep;
        points.push([halfWidth * Math.cos(angle), halfHeight * Math.sin(angle)]);
    }

    return points;
}

function trace<T extends THREE.Path>(path: T, points: [number, number][]) {
    path.moveTo(points[0][0], points[0][1]);

    for (let i = 1; i < points.length; i += 1) {
        path.lineTo(points[i][0], points[i][1]);
    }

    path.closePath();

    return path;
}

/** The staggered grid of round holes punched through the head. */
function punchHoles(shape: THREE.Shape) {
    const spanX = HEAD_HALF_WIDTH - HOLE_RIM;
    const spanY = HEAD_HALF_HEIGHT - HOLE_RIM;
    const rowStep = HOLE_SPACING * (Math.sqrt(3) / 2);
    const rows = Math.ceil(spanY / rowStep);
    const columns = Math.ceil(spanX / HOLE_SPACING) + 1;

    for (let row = -rows; row <= rows; row += 1) {
        const y = row * rowStep;

        if (y < HOLE_FLOOR) {
            continue;
        }

        // Every other row is offset by half a step, so the holes sit on a
        // hexagonal grid the way they do on a real bat.
        const offset = row % 2 === 0 ? 0 : HOLE_SPACING / 2;

        for (let column = -columns; column <= columns; column += 1) {
            const x = column * HOLE_SPACING + offset;

            if ((x / spanX) ** 2 + (y / spanY) ** 2 > 1) {
                continue;
            }

            const hole = new THREE.Path();
            hole.absarc(x, y, HOLE_RADIUS, 0, Math.PI * 2, true);
            shape.holes.push(hole);
        }
    }
}

/** The rounded triangle cut into the throat, between the two shoulders. */
function punchThroat(shape: THREE.Shape) {
    const cut = new THREE.Path();

    cut.moveTo(-0.058, -0.198);
    cut.quadraticCurveTo(0, -0.184, 0.058, -0.198);
    cut.quadraticCurveTo(0.05, -0.262, 0, -0.282);
    cut.quadraticCurveTo(-0.05, -0.262, -0.058, -0.198);

    shape.holes.push(cut);
}

/**
 * Both racket pieces are built head-up around the origin, then flipped, because
 * the racket hangs off the bottom of an arm that points down. The origin is the
 * centre of the face, which is the point the ball has to meet.
 */
function extrudeRacket(shape: THREE.Shape, depth: number) {
    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: false,
        curveSegments: 10,
    });

    geometry.translate(0, 0, -depth / 2);
    geometry.rotateZ(Math.PI);

    return geometry;
}

let frameGeometry: THREE.ExtrudeGeometry | null = null;
let faceGeometry: THREE.ExtrudeGeometry | null = null;

/** The teardrop frame on its own: the face and the throat are cut out of it, so
 *  it can carry a colour the dark face behind it does not. */
export function padelFrame() {
    if (frameGeometry) {
        return frameGeometry;
    }

    const shape = racketOutline();

    shape.holes.push(trace(new THREE.Path(), facePoints(0)));
    punchThroat(shape);

    frameGeometry = extrudeRacket(shape, RACKET_DEPTH);

    return frameGeometry;
}

/**
 * The perforated panel that fills the frame. The holes are real geometry, so
 * they read from any angle and the light passes through them; an alpha map on a
 * squashed sphere could do neither.
 */
export function padelFace() {
    if (faceGeometry) {
        return faceGeometry;
    }

    const shape = trace(new THREE.Shape(), facePoints(FACE_OVERLAP));

    punchHoles(shape);

    faceGeometry = extrudeRacket(shape, FACE_DEPTH);

    return faceGeometry;
}

/** Where the grip meets the frame, measured from the centre of the face. */
export const RACKET_NECK = -NECK_Y;

/** A coat texture with a flat patch capping the crown, painted (no geometry). */
export function catCrownTexture(coat: string, patch: string) {
    const width = 64;
    const height = 64;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (context) {
        context.fillStyle = coat;
        context.fillRect(0, 0, width, height);

        // The top rows of the texture map to the crown; a cap large enough to
        // read from the side, softly faded at its lower edge.
        const gradient = context.createLinearGradient(0, 0, 0, height * 0.38);
        gradient.addColorStop(0, patch);
        gradient.addColorStop(0.62, patch);
        gradient.addColorStop(1, coat);
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height * 0.38);
    }

    const texture = new THREE.CanvasTexture(canvas);

    // A canvas texture is linear by default, so the same hex used as a map
    // comes out visibly lighter than it does as a material colour. That is why
    // a body painted with a texture used to read paler than the legs beside it,
    // which carry the identical colour as a plain material.
    texture.colorSpace = THREE.SRGBColorSpace;

    return texture;
}

/**
 * Tabby banding painted straight into the coat, so the stripes are flush with
 * the body instead of raised geometry. Each band is a row of the texture, a
 * ring around the horizontal body capsule; the texture width runs around that
 * ring, with the spine at its middle and the belly at its edges.
 */
export function stripeTexture(base: string, stripe: string) {
    const width = 128;
    const height = 128;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (context) {
        context.fillStyle = base;
        context.fillRect(0, 0, width, height);
        context.fillStyle = stripe;

        // Fixed seed: the coat must not change pattern between mounts.
        let seed = 7;
        const random = () => {
            seed = (seed * 16807) % 2147483647;
            return seed / 2147483647;
        };

        // Straight rings at even spacing read as a rugby shirt. A mackerel
        // tabby's bars wander, lean back as they drop off the spine, fatten
        // over the back, thin and break up down the flanks. Every wave uses a
        // whole number of periods around the ring so it closes without a seam.
        const count = 9;
        const steps = 64;

        for (let i = 0; i < count; i += 1) {
            const centre = (i + 0.5 + (random() - 0.5) * 0.45) / count;
            const lean = 0.012 + random() * 0.02;
            const wobble = 0.006 + random() * 0.01;
            const wobbleFreq = 2 + Math.floor(random() * 3);
            const wobblePhase = random() * Math.PI * 2;
            const thickness = 0.03 + random() * 0.022;
            const breakFreq = 1 + Math.floor(random() * 3);
            const breakPhase = random() * Math.PI * 2;
            const breakDepth = 0.3 + random() * 0.5;

            const top: [number, number][] = [];
            const bottom: [number, number][] = [];

            for (let s = 0; s <= steps; s += 1) {
                const u = s / steps;
                const angle = u * Math.PI * 2;
                const spine = 0.5 - 0.5 * Math.cos(angle);
                const v =
                    centre +
                    lean * Math.cos(angle) +
                    wobble * Math.sin(angle * wobbleFreq + wobblePhase);
                const half =
                    (thickness / 2) *
                    (0.35 + 0.65 * spine) *
                    Math.max(0, 1 - breakDepth * (1 + Math.sin(angle * breakFreq + breakPhase)));

                top.push([u * width, (v - half) * height]);
                bottom.push([u * width, (v + half) * height]);
            }

            context.beginPath();
            context.moveTo(top[0][0], top[0][1]);
            top.forEach(([x, y]) => context.lineTo(x, y));
            bottom.reverse().forEach(([x, y]) => context.lineTo(x, y));
            context.closePath();
            context.fill();
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

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
