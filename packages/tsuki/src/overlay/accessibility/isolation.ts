import type { OverlayEntry } from '../types'

/** The highest non-hidden modal entry defines the accessibility isolation boundary. */
export function getOverlayAccessibilityBoundaryIndex(entries: readonly OverlayEntry[]) {
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const entry = entries[index]
    if (entry.phase !== 'hidden' && entry.accessibility.mode === 'modal') return index
  }

  return -1
}
