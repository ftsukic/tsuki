import type {
  OverlayBackResultSnapshot,
  OverlayEntry,
  OverlayHostRegistration,
  OverlayMountOptions,
  OverlayRegistry,
  OverlayUpdate,
} from './types'
import type { ResolvedTheme } from '../theme/types'

function freezeEntry(entry: OverlayEntry): OverlayEntry {
  return Object.freeze(entry)
}

function hasSameValues(first: object, second: object) {
  const firstKeys = Object.keys(first)
  const secondKeys = Object.keys(second)
  if (firstKeys.length !== secondKeys.length) return false
  return firstKeys.every(
    (key) =>
      Object.prototype.hasOwnProperty.call(second, key) &&
      Object.is((first as Record<string, unknown>)[key], (second as Record<string, unknown>)[key]),
  )
}

function hasSameTheme(first: ResolvedTheme, second: ResolvedTheme) {
  if (first === second) return true
  if (
    first.scheme !== second.scheme ||
    !hasSameValues(first.semantic, second.semantic) ||
    !hasSameValues(first.motion, second.motion)
  ) {
    return false
  }

  const firstComponents = Object.keys(first.components) as (keyof ResolvedTheme['components'])[]
  const secondComponents = Object.keys(second.components) as (keyof ResolvedTheme['components'])[]
  return (
    firstComponents.length === secondComponents.length &&
    firstComponents.every(
      (name) =>
        Object.prototype.hasOwnProperty.call(second.components, name) &&
        hasSameValues(first.components[name], second.components[name]),
    )
  )
}

export function createOverlayRegistry(): OverlayRegistry {
  const entries = new Map<number, OverlayEntry>()
  const listeners = new Set<() => void>()
  const backResultListeners = new Set<() => void>()
  let nextId = 1
  let hostGeneration = 0
  let host: object | null = null
  let hostRegistration: OverlayHostRegistration | null = null
  let snapshot: readonly OverlayEntry[] = Object.freeze([])
  let backResultSnapshot: OverlayBackResultSnapshot = Object.freeze({ count: 0, consumed: false })
  let disposed = false

  function publishEntries() {
    snapshot = Object.freeze([...entries.values()])
    listeners.forEach((listener) => listener())
  }

  function publishBackResult(consumed: boolean) {
    backResultSnapshot = Object.freeze({ count: backResultSnapshot.count + 1, consumed })
    backResultListeners.forEach((listener) => listener())
    return consumed
  }

  function requireDismissHandler(backBehavior: OverlayEntry['backBehavior'], onBack?: () => void) {
    if (backBehavior === 'dismiss' && !onBack) {
      throw new Error('Overlay entries with backBehavior="dismiss" require an onBack callback.')
    }
  }

  function update(id: number, patch: OverlayUpdate) {
    const current = entries.get(id)
    if (!current || disposed) return false

    const backBehavior = patch.backBehavior ?? current.backBehavior
    const onBack = Object.prototype.hasOwnProperty.call(patch, 'onBack')
      ? patch.onBack
      : current.onBack
    requireDismissHandler(backBehavior, onBack)

    const requestedVisible =
      patch.visible ?? (patch.closing === undefined ? current.visible : !patch.closing)
    let phase = current.phase
    let generation = current.generation

    if (requestedVisible && (phase === 'hidden' || phase === 'exiting')) {
      phase = 'entering'
      generation += 1
    } else if (!requestedVisible && (phase === 'entering' || phase === 'entered')) {
      phase = 'exiting'
      generation += 1
    }

    const next = freezeEntry({
      ...current,
      ...patch,
      visible: requestedVisible,
      phase,
      generation,
      backBehavior,
      onBack,
      closing: phase === 'exiting',
    })
    if (hasSameValues(current, next)) return true
    entries.set(id, next)
    publishEntries()
    return true
  }

  function completeEnter(id: number, generation: number) {
    const current = entries.get(id)
    if (disposed || !current || current.phase !== 'entering' || current.generation !== generation) {
      return false
    }

    entries.set(id, freezeEntry({ ...current, phase: 'entered' }))
    publishEntries()
    return true
  }

  function completeExit(id: number, generation: number) {
    const current = entries.get(id)
    if (disposed || !current || current.phase !== 'exiting' || current.generation !== generation) {
      return false
    }

    entries.delete(id)
    publishEntries()
    return true
  }

  return {
    mount(options: OverlayMountOptions) {
      if (disposed)
        throw new Error('Cannot mount an Overlay entry after its Root has been disposed.')
      requireDismissHandler(options.backBehavior, options.onBack)
      const id = nextId++
      const visible = options.visible ?? true
      const phase = visible ? 'entering' : 'hidden'
      entries.set(
        id,
        freezeEntry({
          id,
          content: options.content,
          mask: options.mask,
          transition: options.transition,
          onTransitionProgress: options.onTransitionProgress,
          phase,
          generation: visible ? 1 : 0,
          visible,
          closing: false,
          backBehavior: options.backBehavior,
          onBack: options.onBack,
          theme: options.theme,
          themeScope: options.themeScope,
        }),
      )
      publishEntries()
      return id
    },

    update,

    unmount(id: number) {
      if (disposed) return false
      if (!entries.delete(id)) return false
      publishEntries()
      return true
    },

    completeEnter,

    completeExit,

    disposeRoot() {
      if (disposed) return
      disposed = true
      entries.clear()
      snapshot = Object.freeze([])
      listeners.clear()
      backResultListeners.clear()
      host = null
      hostRegistration = null
    },

    subscribe(listener: () => void) {
      if (disposed) return () => undefined
      listeners.add(listener)
      return () => listeners.delete(listener)
    },

    getSnapshot() {
      return snapshot
    },

    registerHost(nextHost: object) {
      if (disposed)
        throw new Error('Cannot register an Overlay Host after its Root has been disposed.')
      if (host && host !== nextHost) {
        throw new Error('An OverlayRegistry can only have one registered OverlayHost at a time.')
      }

      const registration = Object.freeze({ host: nextHost, generation: ++hostGeneration })
      host = nextHost
      hostRegistration = registration
      return registration
    },

    unregisterHost(registration: OverlayHostRegistration) {
      if (hostRegistration !== registration) return false
      host = null
      hostRegistration = null
      return true
    },

    dispatchBack() {
      if (disposed) return false
      const top = [...entries.values()].reverse().find((entry) => entry.phase !== 'hidden')
      if (!top) return publishBackResult(false)
      if (top.backBehavior === 'passthrough') return publishBackResult(false)
      if (top.backBehavior === 'consume' || top.phase === 'exiting') return publishBackResult(true)

      const onBack = top.onBack
      if (!onBack) {
        throw new Error(`Overlay entry ${top.id} requires an onBack callback for dismiss behavior.`)
      }

      entries.set(
        top.id,
        freezeEntry({
          ...top,
          visible: false,
          phase: 'exiting',
          generation: top.generation + 1,
          closing: true,
        }),
      )
      publishEntries()
      try {
        onBack()
      } finally {
        publishBackResult(true)
      }
      return true
    },

    updateThemeScope(scope: object, theme: OverlayEntry['theme']) {
      if (disposed) return
      let changed = false
      for (const [id, entry] of entries) {
        if (entry.themeScope !== scope || hasSameTheme(entry.theme, theme)) continue
        entries.set(id, freezeEntry({ ...entry, theme }))
        changed = true
      }
      if (changed) publishEntries()
    },

    subscribeBackResult(listener: () => void) {
      if (disposed) return () => undefined
      backResultListeners.add(listener)
      return () => backResultListeners.delete(listener)
    },

    getBackResultSnapshot() {
      return backResultSnapshot
    },
  }
}
