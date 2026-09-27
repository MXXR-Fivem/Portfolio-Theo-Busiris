import Image from "next/image";

/**
 * Two cats standing side by side, captured from the canvas itself, for reduced
 * motion. The live scene has them run in from off-screen, so it is not shown
 * while the canvas boots.
 *
 * The scene is framed by its vertical field of view, so the picture is pinned
 * to the height of the band and centred, exactly as the canvas is.
 */
export default function CatsStill() {
    return (
        <div className="absolute inset-0 overflow-hidden">
            <Image
                src="/cats-still.webp"
                alt="Two stylised cats standing side by side"
                width={1200}
                height={480}
                unoptimized
                className="absolute left-1/2 top-0 h-full w-auto max-w-none -translate-x-1/2 select-none"
            />
        </div>
    );
}
