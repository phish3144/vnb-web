import type { ReactNode } from 'react';
import { normalizeSearch } from './filter';

/**
 * Map a match range found in the folded (normalizeSearch) string back onto
 * the original text by walking both in lockstep.
 */
function foldedRangeToOriginal(
  original: string,
  foldedStart: number,
  foldedEnd: number,
): [number, number] | null {
  let fi = 0;
  let origStart = -1;
  let origEnd = -1;

  for (let oi = 0; oi < original.length; oi++) {
    const piece = normalizeSearch(original[oi]!);
    if (!piece) {
      // Combining marks / chars that fold away — still count toward original span
      if (origStart >= 0 && origEnd < 0) {
        // keep extending until folded catch-up
      }
      continue;
    }
    const nextFi = fi + piece.length;
    if (origStart < 0 && foldedStart >= fi && foldedStart < nextFi) {
      origStart = oi;
    }
    if (origStart >= 0 && foldedEnd > fi && foldedEnd <= nextFi) {
      origEnd = oi + 1;
      break;
    }
    fi = nextFi;
  }

  if (origStart < 0) return null;
  if (origEnd < 0) origEnd = original.length;
  return [origStart, origEnd];
}

/** Collect non-overlapping highlight ranges in original text for query tokens. */
function matchRanges(text: string, query: string): [number, number][] {
  const tokens = query
    .trim()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
  if (tokens.length === 0 || !text) return [];

  const folded = normalizeSearch(text);
  const ranges: [number, number][] = [];

  for (const token of tokens) {
    const needle = normalizeSearch(token);
    if (!needle) continue;
    let from = 0;
    while (from <= folded.length - needle.length) {
      const idx = folded.indexOf(needle, from);
      if (idx < 0) break;
      const mapped = foldedRangeToOriginal(text, idx, idx + needle.length);
      if (mapped) ranges.push(mapped);
      from = idx + Math.max(needle.length, 1);
    }
  }

  if (ranges.length === 0) {
    // Fallback: case-insensitive substring on original
    const lower = text.toLowerCase();
    for (const token of tokens) {
      const needle = token.toLowerCase();
      if (!needle) continue;
      let from = 0;
      while (from <= lower.length - needle.length) {
        const idx = lower.indexOf(needle, from);
        if (idx < 0) break;
        ranges.push([idx, idx + needle.length]);
        from = idx + Math.max(needle.length, 1);
      }
    }
  }

  if (ranges.length === 0) return [];

  ranges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const merged: [number, number][] = [ranges[0]!];
  for (let i = 1; i < ranges.length; i++) {
    const cur = ranges[i]!;
    const last = merged[merged.length - 1]!;
    if (cur[0] <= last[1]) {
      last[1] = Math.max(last[1], cur[1]);
    } else {
      merged.push(cur);
    }
  }
  return merged;
}

/** Highlight query tokens in `text` (folding-aware when practical). */
export function highlightText(text: string, query: string): ReactNode {
  if (!query.trim() || !text) return text;
  const ranges = matchRanges(text, query);
  if (ranges.length === 0) return text;

  const parts: ReactNode[] = [];
  let cursor = 0;
  ranges.forEach(([start, end], i) => {
    if (start > cursor) {
      parts.push(text.slice(cursor, start));
    }
    parts.push(
      <mark key={`h-${i}-${start}`} className="search-mark">
        {text.slice(start, end)}
      </mark>,
    );
    cursor = end;
  });
  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }
  return <>{parts}</>;
}
