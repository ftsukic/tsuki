import { registerPreviewHost } from './preview-host'
import { useLayoutEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import type { View } from 'react-native'
import type { ImagePreviewRect } from './types'
import { ImagePreviewSourcesContext } from './context'
import type { ImagePreviewSourcesContextValue, ImagePreviewSourceRect } from './context'
import type { ImagePreviewProviderProps } from './types'

const SOURCE_MEASURE_TIMEOUT = 150

type Measurement = (rect: ImagePreviewSourceRect | null) => void
interface SourceEntry {
  ref: RefObject<View | null>
  clipRef?: RefObject<View | null>
  generation: symbol
  pending: Set<Measurement>
}

type SourceStore = ImagePreviewSourcesContextValue

function createSourceStore(): SourceStore {
  const entries = new Map<string, SourceEntry>()
  const owners = new Map<symbol, string>()
  const hiddenCount = new Map<string, number>()
  const listeners = new Map<string, Set<() => void>>()

  const notify = (id: string) => {
    listeners.get(id)?.forEach((listener) => listener())
  }
  const cancelMeasurements = (entry: SourceEntry) => {
    entry.pending.forEach((finish) => finish(null))
  }
  const changeHiddenCount = (id: string, amount: number) => {
    const previous = hiddenCount.get(id) ?? 0
    const next = previous + amount
    if (next > 0) hiddenCount.set(id, next)
    else hiddenCount.delete(id)
    return previous > 0 !== next > 0
  }

  return {
    register(id, ref, clipRef) {
      const previous = entries.get(id)
      if (previous) cancelMeasurements(previous)
      const entry: SourceEntry = { ref, clipRef, generation: Symbol(id), pending: new Set() }
      entries.set(id, entry)
      return () => {
        if (entries.get(id)?.generation === entry.generation) entries.delete(id)
        cancelMeasurements(entry)
      }
    },
    measure(id) {
      const entry = entries.get(id)
      const view = entry?.ref.current
      if (!entry || !view) return Promise.resolve(null)

      return new Promise((resolve) => {
        let settled = false
        const finish: Measurement = (rect) => {
          if (settled) return
          settled = true
          clearTimeout(timeout)
          entry.pending.delete(finish)
          const current = entries.get(id)
          resolve(
            current?.generation === entry.generation && entry.ref.current === view ? rect : null,
          )
        }
        const timeout = setTimeout(() => finish(null), SOURCE_MEASURE_TIMEOUT)
        entry.pending.add(finish)
        try {
          let source: ImagePreviewRect | undefined
          let clip: ImagePreviewRect | undefined
          const clipped = Boolean(entry.clipRef)
          const complete = () => {
            if (source && (!clipped || clip)) finish({ ...source, ...(clip ? { clip } : {}) })
          }
          const read = (target: View, accept: (rect: ImagePreviewRect) => void) =>
            target.measureInWindow((x, y, width, height) => {
              if (![x, y, width, height].every(Number.isFinite) || width <= 0 || height <= 0) {
                finish(null)
                return
              }
              accept({ x, y, width, height })
              complete()
            })
          read(view, (rect) => {
            source = rect
          })
          if (clipped) {
            if (!entry.clipRef?.current) finish(null)
            else
              read(entry.clipRef.current, (rect) => {
                clip = rect
              })
          }
        } catch {
          finish(null)
        }
      })
    },
    hide(owner, id) {
      const previous = owners.get(owner)
      if (previous === id || (previous === undefined && id === null)) return
      if (previous !== undefined) owners.delete(owner)
      if (id !== null) owners.set(owner, id)
      // Apply both changes before subscribers read either image's visibility.
      const previousChanged = previous !== undefined && changeHiddenCount(previous, -1)
      const nextChanged = id !== null && changeHiddenCount(id, 1)
      if (previousChanged) notify(previous!)
      if (nextChanged) notify(id!)
    },
    subscribe(id, listener) {
      let subscription = listeners.get(id)
      if (!subscription) {
        subscription = new Set()
        listeners.set(id, subscription)
      }
      subscription.add(listener)
      return () => {
        subscription.delete(listener)
        if (!subscription.size) listeners.delete(id)
      }
    },
    isHidden(id) {
      return (hiddenCount.get(id) ?? 0) > 0
    },
  }
}

/** Keeps mounted thumbnail anchors and shared preview visibility state. */
export function ImagePreviewProvider({ children }: ImagePreviewProviderProps) {
  const storeRef = useRef<SourceStore | null>(null)
  if (!storeRef.current) storeRef.current = createSourceStore()
  const value = useMemo<ImagePreviewSourcesContextValue>(() => storeRef.current!, [])

  useLayoutEffect(() => registerPreviewHost(value), [value])
  return (
    <ImagePreviewSourcesContext.Provider value={value}>
      {children}
    </ImagePreviewSourcesContext.Provider>
  )
}

ImagePreviewProvider.displayName = 'ImagePreview.Provider'
