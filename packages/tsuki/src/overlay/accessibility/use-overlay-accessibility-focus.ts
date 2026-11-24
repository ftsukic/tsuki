import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { RefCallback } from 'react'
import { AccessibilityInfo } from 'react-native'
import type { View } from 'react-native'
import type { OverlayEntry, OverlayRegistry } from '../types'
import { getOverlayAccessibilityBoundaryIndex } from './isolation'

type FocusRequest =
  | { kind: 'modal'; id: number; generation: number }
  | { kind: 'return'; target: NonNullable<OverlayEntry['accessibility']['returnFocusRef']> }

/** Owns focus requests for this Root Host only. It does not infer focus from native tags. */
export function useOverlayAccessibilityFocus(
  registry: OverlayRegistry,
  entries: readonly OverlayEntry[],
) {
  const boundaryIndex = getOverlayAccessibilityBoundaryIndex(entries)
  const isModalActive = boundaryIndex !== -1
  const currentModal = boundaryIndex === -1 ? null : entries[boundaryIndex]
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false)
  const screenReaderRef = useRef(screenReaderEnabled)
  const currentModalRef = useRef<OverlayEntry | null>(currentModal)
  const entriesRef = useRef(entries)
  const requestsRef = useRef<FocusRequest | null>(null)
  const previousModalRef = useRef<OverlayEntry | null>(null)
  const isMountedRef = useRef(false)
  const containerNodesRef = useRef(new Map<number, View>())
  const layoutReadyIdsRef = useRef(new Set<number>())
  const containerRefCallbacksRef = useRef(new Map<number, RefCallback<View>>())
  const layoutCallbacksRef = useRef(new Map<number, () => void>())
  const scheduledRequestRef = useRef<FocusRequest | null>(null)
  const tryDispatchRef = useRef<() => void>(() => undefined)

  screenReaderRef.current = screenReaderEnabled
  currentModalRef.current = currentModal
  entriesRef.current = entries

  const tryDispatch = useCallback(() => {
    const request = requestsRef.current
    if (!request || !screenReaderRef.current) return
    if (scheduledRequestRef.current === request) return

    let target: View | null | undefined
    if (request.kind === 'modal') {
      const activeModal = currentModalRef.current
      const entry = entriesRef.current.find((candidate) => candidate.id === request.id)
      if (
        !activeModal ||
        activeModal.id !== request.id ||
        activeModal.generation !== request.generation ||
        activeModal.phase === 'exiting' ||
        !entry ||
        entry.generation !== request.generation
      ) {
        requestsRef.current = null
        return
      }
      if (!layoutReadyIdsRef.current.has(request.id)) return
      target = entry.accessibility.initialFocusRef?.current
    } else {
      if (currentModalRef.current) {
        requestsRef.current = null
        return
      }
      target = request.target.current
    }

    if (!target) {
      requestsRef.current = null
      return
    }

    scheduledRequestRef.current = request
    requestAnimationFrame(() => {
      if (scheduledRequestRef.current !== request) return
      scheduledRequestRef.current = null
      if (!isMountedRef.current || requestsRef.current !== request || !screenReaderRef.current)
        return

      let currentTarget: View | null | undefined
      if (request.kind === 'modal') {
        const activeModal = currentModalRef.current
        const entry = entriesRef.current.find((candidate) => candidate.id === request.id)
        if (
          !activeModal ||
          activeModal.id !== request.id ||
          activeModal.generation !== request.generation ||
          activeModal.phase === 'exiting' ||
          !entry ||
          entry.generation !== request.generation ||
          !layoutReadyIdsRef.current.has(request.id)
        ) {
          requestsRef.current = null
          return
        }
        currentTarget = entry.accessibility.initialFocusRef?.current
      } else {
        if (currentModalRef.current) {
          requestsRef.current = null
          return
        }
        currentTarget = request.target.current
      }

      if (!currentTarget) {
        requestsRef.current = null
        return
      }

      try {
        AccessibilityInfo.sendAccessibilityEvent(currentTarget, 'focus')
      } finally {
        requestsRef.current = null
      }
    })
  }, [])

  tryDispatchRef.current = tryDispatch

  useLayoutEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      requestsRef.current = null
      scheduledRequestRef.current = null
    }
  }, [])

  const getContainerRef = useCallback((id: number) => {
    let callback = containerRefCallbacksRef.current.get(id)
    if (!callback) {
      callback = (node) => {
        if (node) {
          containerNodesRef.current.set(id, node)
          tryDispatchRef.current()
        } else {
          containerNodesRef.current.delete(id)
        }
      }
      containerRefCallbacksRef.current.set(id, callback)
    }
    return callback
  }, [])

  const getLayoutHandler = useCallback((id: number) => {
    let handler = layoutCallbacksRef.current.get(id)
    if (!handler) {
      handler = () => {
        layoutReadyIdsRef.current.add(id)
        tryDispatchRef.current()
      }
      layoutCallbacksRef.current.set(id, handler)
    }
    return handler
  }, [])

  useEffect(() => {
    if (!isModalActive) return

    let active = true
    let changedByEvent = false
    const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', (enabled) => {
      changedByEvent = true
      setScreenReaderEnabled(enabled)
    })

    void AccessibilityInfo.isScreenReaderEnabled().then(
      (enabled) => {
        if (active && !changedByEvent) setScreenReaderEnabled(enabled)
      },
      () => {
        if (active && !changedByEvent) setScreenReaderEnabled(false)
      },
    )

    return () => {
      active = false
      subscription.remove()
    }
  }, [isModalActive, registry])

  useLayoutEffect(() => {
    const activeModal = currentModalRef.current
    const previous = previousModalRef.current
    previousModalRef.current = activeModal

    if (!previous && activeModal) {
      requestsRef.current =
        activeModal.phase === 'exiting'
          ? null
          : { kind: 'modal', id: activeModal.id, generation: activeModal.generation }
    } else if (previous && !activeModal) {
      requestsRef.current = previous.accessibility.returnFocusRef
        ? { kind: 'return', target: previous.accessibility.returnFocusRef }
        : null
    } else if (previous && activeModal && previous.id !== activeModal.id) {
      requestsRef.current =
        activeModal.phase === 'exiting'
          ? null
          : { kind: 'modal', id: activeModal.id, generation: activeModal.generation }
    } else if (
      previous &&
      activeModal &&
      previous.id === activeModal.id &&
      previous.generation !== activeModal.generation
    ) {
      requestsRef.current =
        activeModal.phase === 'entering'
          ? { kind: 'modal', id: activeModal.id, generation: activeModal.generation }
          : null
    }

    tryDispatchRef.current()
  }, [currentModal?.id, currentModal?.generation, currentModal?.phase, screenReaderEnabled])

  useEffect(() => {
    const activeIds = new Set(entries.map((entry) => entry.id))
    const trackedIds = new Set<number>([
      ...containerNodesRef.current.keys(),
      ...layoutReadyIdsRef.current,
      ...containerRefCallbacksRef.current.keys(),
      ...layoutCallbacksRef.current.keys(),
    ])
    for (const id of trackedIds) {
      if (activeIds.has(id)) continue
      containerNodesRef.current.delete(id)
      layoutReadyIdsRef.current.delete(id)
      containerRefCallbacksRef.current.delete(id)
      layoutCallbacksRef.current.delete(id)
    }
  }, [entries])

  return {
    boundaryIndex,
    getContainerRef,
    getLayoutHandler,
  }
}
