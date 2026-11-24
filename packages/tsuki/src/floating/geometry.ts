import type { FloatingRect } from './types'

export function windowRectToHost(rect: FloatingRect, hostWindowRect: FloatingRect): FloatingRect {
  return {
    x: rect.x - hostWindowRect.x,
    y: rect.y - hostWindowRect.y,
    width: rect.width,
    height: rect.height,
  }
}

export function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), Math.max(minimum, maximum))
}
