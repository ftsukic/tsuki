interface LockedElement {
  count: number
  styles: Array<[string, string, string]>
}
const lockedElements = new Map<HTMLElement, LockedElement>()
const scrollRegions = new Map<
  symbol,
  {
    scroll: (target: EventTarget | null, dx: number, dy: number) => boolean
    contains: (target: EventTarget | null) => boolean
  }
>()

function isElement(node: unknown): node is HTMLElement {
  return !!node && typeof node === 'object' && 'nodeType' in node && node.nodeType === 1
}

/** Preserve nested scroll containers and allow only the popup or horizontal menu to consume scroll. */
export function lockWebBackgroundScroll(
  anchor: unknown,
  getPanel: () => unknown,
  onEscape: () => void,
  onAnchorScroll: () => void,
) {
  if (!isElement(anchor)) return () => undefined
  const doc = anchor.ownerDocument
  const win = doc.defaultView
  if (!win) return () => undefined
  const containers = new Set<HTMLElement>([doc.documentElement, doc.body])
  for (let node: HTMLElement | null = anchor.parentElement; node; node = node.parentElement) {
    if (
      lockedElements.has(node) ||
      /(auto|scroll|overlay)/.test(
        win.getComputedStyle(node).overflow + win.getComputedStyle(node).overflowY,
      )
    ) {
      containers.add(node)
    }
  }
  for (const node of containers) {
    const existing = lockedElements.get(node)
    if (existing) existing.count += 1
    else {
      lockedElements.set(node, {
        count: 1,
        styles: ['overflow', 'overflow-x', 'overflow-y'].map((property) => [
          property,
          node.style.getPropertyValue(property),
          node.style.getPropertyPriority(property),
        ]),
      })
      node.style.setProperty('overflow', 'hidden')
    }
  }

  const canScroll = (target: EventTarget | null, dx: number, dy: number) => {
    if (!isElement(target)) return false
    const panel = getPanel()
    const inPanel = isElement(panel) && panel.contains(target)
    const inMenu = anchor.contains(target)
    if (!inPanel && !inMenu) return false
    const horizontal = Math.abs(dx) > Math.abs(dy)
    if (inMenu && !horizontal) return false
    const boundary = inPanel ? (panel as HTMLElement) : anchor
    for (let node: HTMLElement | null = target; node; node = node.parentElement) {
      const css = win.getComputedStyle(node)
      const delta = horizontal ? dx : dy
      const overflow = (horizontal ? css.overflowX : css.overflowY) || css.overflow
      const position = horizontal ? node.scrollLeft : node.scrollTop
      const range = horizontal
        ? node.scrollWidth - node.clientWidth
        : node.scrollHeight - node.clientHeight
      if (
        /(auto|scroll|overlay)/.test(overflow) &&
        range > 0 &&
        ((delta < 0 && position > 0) || (delta > 0 && position < range - 1))
      )
        return true
      if (node === boundary) break
    }
    return false
  }
  const owner = Symbol('web-scroll-lock')
  scrollRegions.set(owner, {
    scroll: canScroll,
    contains: (target) => {
      const panel = getPanel()
      return (
        isElement(target) &&
        (anchor.contains(target) || (isElement(panel) && panel.contains(target)))
      )
    },
  })
  const allowedScroll = (target: EventTarget | null, dx: number, dy: number) =>
    [...scrollRegions.values()].some((region) => region.scroll(target, dx, dy))
  const wheel = (event: WheelEvent) => {
    if (!event.ctrlKey && !allowedScroll(event.target, event.deltaX, event.deltaY))
      event.preventDefault()
  }
  let touchX = 0
  let touchY = 0
  const touchStart = (event: TouchEvent) => {
    touchX = event.touches[0]?.clientX ?? 0
    touchY = event.touches[0]?.clientY ?? 0
  }
  const touchMove = (event: TouchEvent) => {
    if (event.touches.length !== 1) return
    const next = event.touches[0]
    if (!allowedScroll(event.target, touchX - next.clientX, touchY - next.clientY))
      event.preventDefault()
    touchX = next.clientX
    touchY = next.clientY
  }
  const keyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented) return
    if (event.key === 'Escape' && [...scrollRegions.keys()].at(-1) === owner) {
      event.preventDefault()
      onEscape()
      return
    }
    if ([...scrollRegions.values()].some((region) => region.contains(event.target))) return
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) {
      // Keep keyboard activation of the menu trigger available.
      if (event.key === ' ' && isElement(event.target) && anchor.contains(event.target)) return
      event.preventDefault()
    }
  }
  const scroll = (event: Event) => {
    if (containers.has(event.target as HTMLElement) || event.target === doc) onAnchorScroll()
  }
  doc.addEventListener('wheel', wheel, { passive: false, capture: true })
  doc.addEventListener('touchstart', touchStart, { passive: true, capture: true })
  doc.addEventListener('touchmove', touchMove, { passive: false, capture: true })
  doc.addEventListener('keydown', keyDown)
  doc.addEventListener('scroll', scroll, true)
  let released = false
  return () => {
    if (released) return
    released = true
    scrollRegions.delete(owner)
    doc.removeEventListener('wheel', wheel, true)
    doc.removeEventListener('touchstart', touchStart, true)
    doc.removeEventListener('touchmove', touchMove, true)
    doc.removeEventListener('keydown', keyDown)
    doc.removeEventListener('scroll', scroll, true)
    for (const node of containers) {
      const saved = lockedElements.get(node)
      if (!saved || --saved.count > 0) continue
      node.style.removeProperty('overflow')
      node.style.removeProperty('overflow-x')
      node.style.removeProperty('overflow-y')
      for (const [property, value, priority] of saved.styles) {
        if (value) node.style.setProperty(property, value, priority)
      }
      lockedElements.delete(node)
    }
  }
}
