import os
from PIL import Image, ImageDraw

def add_rounded_corners(im, radius_ratio=0.22):
    im = im.convert("RGBA")
    w, h = im.size
    
    # 2x supersampling for fast & smooth anti-aliasing
    scale = 2
    sw, sh = w * scale, h * scale
    radius = int(min(sw, sh) * radius_ratio)
    
    mask = Image.new("L", (sw, sh), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([0, 0, sw - 1, sh - 1], radius=radius, fill=255)
    
    mask = mask.resize((w, h), Image.Resampling.LANCZOS)
    
    output = im.copy()
    output.putalpha(mask)
    return output

def process_all():
    public_dir = os.path.abspath("public")
    files = ["logo.png", "favicon.png", "favicon.ico", "apple-touch-icon.png", "pwa-192x192.png", "pwa-512x512.png"]
    
    for f in files:
        path = os.path.join(public_dir, f)
        if os.path.exists(path):
            with Image.open(path) as img:
                rounded = add_rounded_corners(img, radius_ratio=0.22)
                rounded.save(path, format="PNG")
                print(f"Processed: {f}")

if __name__ == "__main__":
    process_all()
