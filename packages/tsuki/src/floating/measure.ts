import type { View } from 'react-native'
import type { FloatingRect } from './types'

export function measureViewInWindow(view: View | null): Promise<FloatingRect | null> {
  if (!view || typeof view.measureInWindow !== 'function') return Promise.resolve(null)

  return new Promise((resolve) => {
    try {
      view.measureInWindow((x, y, width, height) => {
        if (
          !Number.isFinite(x) ||
          !Number.isFinite(y) ||
          !Number.isFinite(width) ||
          !Number.isFinite(height)
        ) {
          resolve(null)
          return
        }
        resolve({ x, y, width, height })
      })
    } catch {
      resolve(null)
    }
  })
}
