import type {
  OverlayBackResultSnapshot,
  OverlayEntry,
  OverlayHostRegistration,
  OverlayMountOptions,
  OverlayRegistry,
  OverlayUpdate,
  PortalEntry,
  PortalHostRegistration,
  PortalMountOptions,
  PortalUpdate,
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

function resolveAccessibility(
  config: OverlayMountOptions['accessibility'],
  current?: OverlayEntry['accessibility'],
): OverlayEntry['accessibility'] {
  const mode = config?.mode ?? 'non-modal'
  const initialFocusRef = config?.initialFocusRef
  const returnFocusRef = config?.returnFocusRef
  if (
    current &&
    current.mode === mode &&
    current.initialFocusRef === initialFocusRef &&
    current.returnFocusRef === returnFocusRef
  ) {
    return current
  }

  return Object.freeze({ mode, initialFocusRef, returnFocusRef })
}

export function createOverlayRegistry(): OverlayRegistry {
  const entries = new Map<number, OverlayEntry>()
  const portalEntries = new Map<number, PortalEntry>()
  const listeners = new Set<() => void>()
  const portalListeners = new Set<() => void>()
  const portalHosts = new Map<string, { host: object; registration: PortalHostRegistration }>()
  const backResultListeners = new Set<() => void>()
  let nextId = 1
  let nextPortalId = 1
  let nextOrder = 0
  let hostGeneration = 0
  let portalHostGeneration = 0
  let host: object | null = null
  let hostRegistration: OverlayHostRegistration | null = null
  let snapshot: readonly OverlayEntry[] = Object.freeze([])
  let portalSnapshot: readonly PortalEntry[] = Object.freeze([])
  let backResultSnapshot: OverlayBackResultSnapshot = Object.freeze({ count: 0, consumed: false })
  let disposed = false

  function publishEntries() {
    snapshot = Object.freeze([...entries.values()])
    listeners.forEach((listener) => listener())
  }

  function publishPortals() {
    portalSnapshot = Object.freeze([...portalEntries.values()])
    portalListeners.forEach((listener) => listener())
  }

  function updatePortal(id: number, patch: PortalUpdate) {
    const current = portalEntries.get(id)
    if (!current || disposed) return false

    const next = Object.freeze({ ...current, ...patch })
    if (hasSameValues(current, next)) return true
    portalEntries.set(id, next)
    publishPortals()
    return true
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
    const onEntered = Object.prototype.hasOwnProperty.call(patch, 'onEntered')
      ? patch.onEntered
      : current.onEntered
    const onExited = Object.prototype.hasOwnProperty.call(patch, 'onExited')
      ? patch.onExited
      : current.onExited
    const busy = patch.busy ?? current.busy
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
      onEntered,
      onExited,
      busy,
      closing: phase === 'exiting',
      accessibility: Object.prototype.hasOwnProperty.call(patch, 'accessibility')
        ? resolveAccessibility(patch.accessibility, current.accessibility)
        : current.accessibility,
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
    current.onEntered?.()
    return true
  }

  function completeExit(id: number, generation: number) {
    const current = entries.get(id)
    if (disposed || !current || current.phase !== 'exiting' || current.generation !== generation) {
      return false
    }

    entries.delete(id)
    publishEntries()
    current.onExited?.()
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
          order: nextOrder++,
          content: options.content,
          mask: options.mask,
          transition: options.transition,
          onTransitionProgress: options.onTransitionProgress,
          phase,
          generation: visible ? 1 : 0,
          visible,
          closing: false,
          busy: options.busy ?? false,
          backBehavior: options.backBehavior,
          onBack: options.onBack,
          onEntered: options.onEntered,
          onExited: options.onExited,
          accessibility: resolveAccessibility(options.accessibility),
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
      portalEntries.clear()
      snapshot = Object.freeze([])
      portalSnapshot = Object.freeze([])
      portalHosts.clear()
      listeners.clear()
      portalListeners.clear()
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

    mountPortal(options: PortalMountOptions) {
      if (disposed) throw new Error('Cannot mount a Portal entry after its Root has been disposed.')
      const id = nextPortalId++
      portalEntries.set(
        id,
        Object.freeze({
          id,
          order: nextOrder++,
          host: options.host ?? 'root',
          content: options.content,
          theme: options.theme,
          themeScope: options.themeScope,
        }),
      )
      publishPortals()
      return id
    },

    updatePortal,

    unmountPortal(id: number) {
      if (disposed || !portalEntries.delete(id)) return false
      publishPortals()
      return true
    },

    subscribePortals(listener: () => void) {
      if (disposed) return () => undefined
      portalListeners.add(listener)
      return () => portalListeners.delete(listener)
    },

    getPortalSnapshot() {
      return portalSnapshot
    },

    registerPortalHost(name: string, nextHost: object) {
      if (disposed)
        throw new Error('Cannot register a PortalHost after its Root has been disposed.')
      if (!name.trim() || name === 'root') {
        throw new Error(
          'PortalHost names must be non-empty and cannot use the reserved name "root".',
        )
      }
      const current = portalHosts.get(name)
      if (current && current.host !== nextHost) {
        throw new Error(`A PortalHost named "${name}" is already registered in this Root.`)
      }
      const registration = Object.freeze({
        name,
        host: nextHost,
        generation: ++portalHostGeneration,
      })
      portalHosts.set(name, { host: nextHost, registration })
      return registration
    },

    unregisterPortalHost(registration: PortalHostRegistration) {
      if (portalHosts.get(registration.name)?.registration !== registration) return false
      portalHosts.delete(registration.name)
      return true
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
      if (top.backBehavior === 'consume' || top.phase === 'exiting' || top.busy) {
        return publishBackResult(true)
      }

      const onBack = top.onBack
      if (!onBack) {
        throw new Error(`Overlay entry ${top.id} requires an onBack callback for dismiss behavior.`)
      }

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

      let portalsChanged = false
      for (const [id, entry] of portalEntries) {
        if (entry.themeScope !== scope || hasSameTheme(entry.theme, theme)) continue
        portalEntries.set(id, Object.freeze({ ...entry, theme }))
        portalsChanged = true
      }
      if (portalsChanged) publishPortals()
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
