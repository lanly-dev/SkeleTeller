#!/usr/bin/env python3
"""
Generate placeholder assets for the sample storyboard.
This creates simple colored images with labels for demonstration purposes.
"""

from PIL import Image, ImageDraw, ImageFont
from pathlib import Path


def create_placeholder(filename, width, height, bg_color, text, text_color=(255, 255, 255)):
    """Create a simple placeholder image with text."""
    img = Image.new('RGB', (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)
    
    # Try to use a nice font, fall back to default if not available
    try:
        font = ImageFont.truetype("arial.ttf", 48)
        small_font = ImageFont.truetype("arial.ttf", 24)
    except:
        font = ImageFont.load_default()
        small_font = ImageFont.load_default()
    
    # Draw main text
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    position = ((width - text_width) / 2, (height - text_height) / 2)
    draw.text(position, text, fill=text_color, font=font)
    
    # Draw filename label in corner
    draw.text((10, 10), filename, fill=(200, 200, 200), font=small_font)
    
    return img


def main():
    """Generate all placeholder assets for the sample storyboard."""
    assets_dir = Path(__file__).parent / "assets"
    assets_dir.mkdir(exist_ok=True)
    
    # Standard resolution
    width, height = 1920, 1080
    
    # Generate assets
    assets = [
        ("title-bg.png", (26, 35, 48), "TaskFlow"),
        ("dashboard.png", (41, 98, 255), "Dashboard View"),
        ("quick-add.png", (76, 175, 80), "Quick Add Feature"),
        ("task-detail.png", (255, 152, 0), "Task Details"),
        ("github-integration.png", (156, 39, 176), "GitHub Integration"),
        ("outro-bg.png", (38, 50, 56), "Thank You"),
    ]
    
    for filename, color, text in assets:
        img = create_placeholder(filename, width, height, color, text)
        output_path = assets_dir / filename
        img.save(output_path)
        print(f"✅ Created {filename}")
    
    print(f"\n🎉 Generated {len(assets)} placeholder assets in {assets_dir}")


if __name__ == "__main__":
    main()
