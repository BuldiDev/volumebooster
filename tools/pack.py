"""Build dist/volume-booster-<version>.zip with the runtime files only."""

import json
import pathlib
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"

FILES = [
    "manifest.json",
    "background.js",
    "content.js",
    "popup.html",
    "popup.css",
    "popup.js",
    "icons/icon16.png",
    "icons/icon48.png",
    "icons/icon128.png",
]


def main() -> None:
    version = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))["version"]
    DIST.mkdir(exist_ok=True)
    target = DIST / f"volume-booster-{version}.zip"

    missing = [f for f in FILES if not (ROOT / f).exists()]
    if missing:
        raise SystemExit(f"missing files: {', '.join(missing)}")

    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as zf:
        for name in FILES:
            zf.write(ROOT / name, name)

    print(f"{target.relative_to(ROOT)}  ({target.stat().st_size / 1024:.1f} KB, {len(FILES)} files)")


if __name__ == "__main__":
    main()
