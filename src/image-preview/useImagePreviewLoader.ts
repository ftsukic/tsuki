import { useEffect, useRef } from 'react'
import { defaultImagePreviewAdapter, getImagePreviewSourceKey } from './image-adapter'
import type { ImagePreviewImage, ImagePreviewImageAdapter } from './types'

const MAX_PREFETCH_HISTORY = 24

interface PrefetchSession {
  adapter: ImagePreviewImageAdapter
  requests: Map<string, object>
}

/** Warming a bounded native cache does not make a subsequently mounted image node ready. */
export function useImagePreviewLoader(
  items: readonly ImagePreviewImage[],
  activeIndex: number,
  visible: boolean,
  adapter: ImagePreviewImageAdapter = defaultImagePreviewAdapter,
): void {
  const sessionRef = useRef<PrefetchSession | null>(null)

  useEffect(() => {
    if (!visible) {
      sessionRef.current = null
      return
    }
    if (activeIndex < 0 || activeIndex >= items.length || !adapter.preload) return
    if (sessionRef.current?.adapter !== adapter) {
      sessionRef.current = { adapter, requests: new Map() }
    }
    const { requests } = sessionRef.current
    const activeItem = items[activeIndex]
    const activeSource = activeItem?.type === 'video' ? activeItem.thumbnail : activeItem?.source
    const activeKey = activeSource ? getImagePreviewSourceKey(activeSource) : undefined
    for (const index of [activeIndex - 1, activeIndex + 1]) {
      const item = items[index]
      if (!item) continue
      const source = item.type === 'video' ? item.thumbnail : item.source
      if (!source) continue
      const key = getImagePreviewSourceKey(source)
      // The current page already has a mounted Image node; don't compete with it.
      if (key === activeKey) continue
      if (requests.has(key)) continue
      const request = {}
      requests.set(key, request)
      while (requests.size > MAX_PREFETCH_HISTORY) {
        const oldest = requests.keys().next().value
        if (oldest !== undefined) requests.delete(oldest)
      }
      const forgetFailure = () => {
        if (requests.get(key) === request) requests.delete(key)
      }
      try {
        void Promise.resolve(adapter.preload(source)).catch(forgetFailure)
      } catch {
        forgetFailure()
      }
    }
  }, [activeIndex, adapter, items, visible])

  useEffect(
    () => () => {
      sessionRef.current = null
    },
    [],
  )
}
