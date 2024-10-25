from pathlib import Path
from PIL import Image
import os


os.makedirs("./assets/thumbnails/placeholders", exist_ok=True)
for path in Path("./assets/thumbnails/").glob("*"):
    name = path.stem
    if name != "placeholders":
        img = Image.open(path)
        img.save(f"./assets/thumbnails/placeholders/{name}.jpeg", optimize=True)