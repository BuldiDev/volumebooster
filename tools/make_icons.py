"""Rasterize icon.svg into icons/icon{16,48,128}.png using headless Chrome."""

import pathlib
import subprocess
import tempfile

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
SVG = ROOT / "icon.svg"
OUT = ROOT / "icons"
SIZES = (16, 48, 128)
RENDER = 512  # render large, then downscale: cleaner edges

CHROME = next(
    p
    for p in (
        pathlib.Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe"),
        pathlib.Path(r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"),
        pathlib.Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
    )
    if p.exists()
)

PAGE = """<!doctype html>
<style>html,body{{margin:0;padding:0;background:transparent}}
svg{{display:block;width:{size}px;height:{size}px}}</style>
{svg}
"""


def main() -> None:
    OUT.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        tmp = pathlib.Path(tmp)
        page = tmp / "icon.html"
        page.write_text(PAGE.format(size=RENDER, svg=SVG.read_text(encoding="utf-8")), encoding="utf-8")
        shot = tmp / "shot.png"
        subprocess.run(
            [
                str(CHROME),
                "--headless=new",
                "--disable-gpu",
                "--hide-scrollbars",
                "--default-background-color=00000000",
                f"--window-size={RENDER},{RENDER}",
                f"--screenshot={shot}",
                f"--user-data-dir={tmp / 'profile'}",
                page.as_uri(),
            ],
            check=True,
            capture_output=True,
        )

        base = Image.open(shot).convert("RGBA")
        for size in SIZES:
            base.resize((size, size), Image.LANCZOS).save(OUT / f"icon{size}.png")
            print(f"icons/icon{size}.png")


if __name__ == "__main__":
    main()
