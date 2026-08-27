#!/usr/bin/env python3
"""
mascot_cutout.py — background removal + bold black outline for mascot art.

    python3 mascot_cutout.py IN.png OUT.png [--outline 14] [--keep-bg]

Only needed for mascot images that still have an opaque/white background. Most
user-supplied mascot art is already exported as a transparent PNG — in that case just
copy the file straight into public/mascots/<name>/ and skip this script entirely
(see step 1 of SKILL.md).

The outline is a chunky black sticker edge, deliberately different from the white
paper-sticker edge the vox-collage style uses: a white edge disappears against the
light scene backgrounds this style leans on.

Dependencies (install ONLY if you actually need this script):
    pip3 install rembg onnxruntime scipy pillow numpy
"""

import argparse
import os
import sys

DEFAULT_OUTLINE = 14


def die(msg: str) -> None:
    print(f"error: {msg}", file=sys.stderr)
    sys.exit(1)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("src")
    ap.add_argument("dst")
    ap.add_argument("--outline", type=int, default=DEFAULT_OUTLINE,
                    help=f"outline thickness in px (default {DEFAULT_OUTLINE}, 0 = none)")
    ap.add_argument("--keep-bg", action="store_true",
                    help="skip rembg; the image is already transparent, just outline it")
    args = ap.parse_args()

    if not os.path.isfile(args.src):
        die(f"no such file: {args.src}\n"
            "Note: images pasted into the chat are NOT files on disk — ask the user to "
            "drop the real files into public/mascots/<name>/raw/ instead of hunting for them.")

    try:
        import numpy as np
        from PIL import Image
    except ImportError:
        die("missing pillow/numpy — pip3 install pillow numpy")

    img = Image.open(args.src).convert("RGBA")

    if not args.keep_bg:
        try:
            from rembg import remove
        except ImportError:
            die("missing rembg — pip3 install rembg onnxruntime\n"
                "(or pass --keep-bg if this image is already transparent)")
        img = remove(img).convert("RGBA")

    if args.outline > 0:
        img = add_outline(img, args.outline, np, Image)

    os.makedirs(os.path.dirname(os.path.abspath(args.dst)), exist_ok=True)
    img.save(args.dst)
    print(f"wrote {args.dst} ({img.width}x{img.height})")


def add_outline(img, thickness, np, Image):
    """Dilate the alpha channel and paint the grown ring solid black behind the art."""
    try:
        from scipy.ndimage import binary_dilation, gaussian_filter
    except ImportError:
        die("missing scipy — pip3 install scipy")

    pad = thickness + 4
    img = add_padding(img, pad, Image)

    alpha = np.array(img.split()[-1])
    solid = alpha > 128

    # Round structuring element so corners come out rounded, not square.
    r = thickness
    yy, xx = np.mgrid[-r:r + 1, -r:r + 1]
    disk = (xx * xx + yy * yy) <= r * r

    grown = binary_dilation(solid, structure=disk)
    # Feather the outline edge by a pixel so it doesn't alias against the scene.
    edge = gaussian_filter(grown.astype(np.float32), sigma=0.8)
    edge_alpha = np.clip(edge * 255.0, 0, 255).astype(np.uint8)

    outline = Image.fromarray(
        np.dstack([
            np.zeros_like(edge_alpha),
            np.zeros_like(edge_alpha),
            np.zeros_like(edge_alpha),
            edge_alpha,
        ]),
        mode="RGBA",
    )
    outline.alpha_composite(img)
    return outline


def add_padding(img, pad, Image):
    out = Image.new("RGBA", (img.width + pad * 2, img.height + pad * 2), (0, 0, 0, 0))
    out.paste(img, (pad, pad))
    return out


if __name__ == "__main__":
    main()
