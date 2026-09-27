import Image from "next/image";

/**
 * The first frame of the hero scene, captured from the canvas itself, so the
 * hand-off to the live scene changes nothing on screen. Shown while the canvas
 * boots, and kept for reduced motion, missing WebGL and devices that would not
 * hold a frame rate.
 *
 * The scene is framed by its vertical field of view, so the picture is pinned
 * to the height of the stage and centred, exactly as the canvas is. Retake it
 * whenever the camera or the opening pose of PadelScene changes.
 */
export default function PadelStill() {
    return (
        <div className="absolute inset-0 overflow-hidden">
            <Image
                src="/hero-still.webp"
                alt="Stylised padel player standing behind the net"
                width={2040}
                height={1200}
                priority
                unoptimized
                className="absolute left-1/2 top-0 h-full w-auto max-w-none -translate-x-1/2 select-none"
            />
        </div>
    );
}
