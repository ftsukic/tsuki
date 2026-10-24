import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { GestureResponderEvent } from 'react-native'
import type { SwipeCellDismissBinding, SwipeCellDismissController, SwipeCellRef } from './types'

interface RowEntry {
  handle: SwipeCellRef | null
  props: SwipeCellDismissBinding
}

/** Page-local coordination; observes touches without taking the native responder. */
export function useSwipeCellDismiss(): SwipeCellDismissController {
  const rows = useRef(new Map<string, RowEntry>())
  const active = useRef<RowEntry | null>(null)
  const touchSequence = useRef(0)
  const mounted = useRef(true)

  const close = useCallback(() => {
    const previous = active.current
    active.current = null
    touchSequence.current += 1
    previous?.handle?.close()
  }, [])

  const getSwipeCellProps = useCallback(
    (id: string): SwipeCellDismissBinding => {
      const existing = rows.current.get(id)
      if (existing) return existing.props
      const entry: RowEntry = {
        handle: null,
        props: {
          ref: (handle) => {
            entry.handle = handle
            if (handle) rows.current.set(id, entry)
            else {
              if (rows.current.get(id) === entry) rows.current.delete(id)
              // Composed callback refs can detach and reattach within the same commit.
              queueMicrotask(() => {
                if (!entry.handle && active.current === entry) active.current = null
              })
            }
          },
          onOpenStart: () => {
            if (!mounted.current || !entry.handle || rows.current.get(id) !== entry) return
            if (active.current !== entry) {
              const previous = active.current
              active.current = entry
              previous?.handle?.close()
            }
          },
          onClose: () => {
            if (active.current === entry) active.current = null
          },
          onTouchStart: () => {
            if (active.current && active.current !== entry) close()
          },
        },
      }
      rows.current.set(id, entry)
      return entry.props
    },
    [close],
  )

  const observeTouch = useCallback(
    (event: GestureResponderEvent) => {
      const sequence = ++touchSequence.current
      const entry = active.current
      const handle = entry?.handle
      const { pageX, pageY } = event.nativeEvent
      if (entry && handle?.measure && Number.isFinite(pageX) && Number.isFinite(pageY)) {
        handle.measure((_x, _y, width, height, x, y) => {
          if (
            !mounted.current ||
            sequence !== touchSequence.current ||
            active.current !== entry ||
            entry.handle !== handle
          )
            return
          if (![x, y, width, height].every(Number.isFinite) || width <= 0 || height <= 0) return
          if (pageX < x || pageX > x + width || pageY < y || pageY > y + height) close()
        })
      }
      return false
    },
    [close],
  )

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      close()
    }
  }, [close])

  return useMemo(
    () => ({
      containerProps: { onStartShouldSetResponderCapture: observeTouch },
      getSwipeCellProps,
      close,
    }),
    [observeTouch, getSwipeCellProps, close],
  )
}
