#!/usr/bin/env python3
"""Refresh VNB CSV from a slim export URL.

Does NOT download MaStR bulk dumps (~3GB) or use open-mastr DB in CI.
Set env VNB_CSV_URL to a slim CSV export; without it this script is a no-op.
"""

from __future__ import annotations

import argparse
import os
import sys
import tempfile
import urllib.error
import urllib.request
from pathlib import Path


DEFAULT_OUT = Path("public/data/vnb.csv")


def _validate_csv(data: bytes) -> None:
    if not data or not data.strip():
        raise SystemExit("Downloaded CSV is empty")
    # Prefer first non-empty line as header (handles optional BOM / blank lines)
    text = data.decode("utf-8-sig", errors="replace")
    header = next((ln.strip() for ln in text.splitlines() if ln.strip()), "")
    if ";" not in header:
        raise SystemExit(
            "CSV validation failed: header line must contain semicolons"
        )


def download_to(url: str, out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    try:
        with urllib.request.urlopen(url, timeout=120) as resp:
            data = resp.read()
    except urllib.error.URLError as exc:
        raise SystemExit(f"Download failed: {exc}") from exc

    _validate_csv(data)

    fd, tmp_name = tempfile.mkstemp(
        dir=out.parent, prefix=out.name + ".", suffix=".tmp"
    )
    try:
        with os.fdopen(fd, "wb") as tmp:
            tmp.write(data)
        os.replace(tmp_name, out)
    except Exception:
        try:
            os.unlink(tmp_name)
        except OSError:
            pass
        raise

    print(f"Wrote {out} ({len(data)} bytes)")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--out",
        type=Path,
        default=DEFAULT_OUT,
        help=f"Output CSV path (default: {DEFAULT_OUT})",
    )
    args = parser.parse_args(argv)

    url = os.environ.get("VNB_CSV_URL", "").strip()
    if not url:
        print(
            "VNB_CSV_URL not set; skipping download (no file changes).",
            file=sys.stderr,
        )
        return 0

    download_to(url, args.out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
