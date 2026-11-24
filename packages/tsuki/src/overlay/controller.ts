import type { ResolvedTheme } from '../theme/types'
import type { OverlayRegistry, OverlayMountOptions, OverlayUpdate } from './types'

export type OverlayControllerScope = 'current' | 'root'

export type OverlayOpenOptions = Omit<OverlayMountOptions, 'theme' | 'themeScope' | 'visible'>

export type OverlayControllerUpdate = Partial<
  Pick<
    OverlayOpenOptions,
    | 'content'
    | 'mask'
    | 'transition'
    | 'onTransitionProgress'
    | 'backBehavior'
    | 'onBack'
    | 'onEntered'
    | 'onExited'
    | 'busy'
    | 'accessibility'
  >
>

export interface OverlayHandle {
  readonly id: number
  update(patch: OverlayControllerUpdate): boolean
  close(): boolean
}

export interface OverlayController {
  open(options: OverlayOpenOptions): OverlayHandle
}

interface OverlayControllerBinding {
  theme: ResolvedTheme
  themeScope: object
}

interface OwnedEntry {
  readonly id: number
  readonly registry: OverlayRegistry
  readonly handle: OverlayHandle
  released: boolean
}

export interface OverlayControllerOwner {
  readonly registry: OverlayRegistry
  binding: OverlayControllerBinding | null
  active: boolean
  lease: number
  readonly entries: Map<number, OwnedEntry>
  unsubscribe: (() => void) | null
}

export function createOverlayControllerOwner(registry: OverlayRegistry): OverlayControllerOwner {
  return {
    registry,
    binding: null,
    active: true,
    lease: 0,
    entries: new Map(),
    unsubscribe: null,
  }
}

export function bindOverlayControllerOwner(
  owner: OverlayControllerOwner,
  theme: ResolvedTheme,
  themeScope: object,
) {
  owner.binding = { theme, themeScope }
}

export function createOverlayController(owner: OverlayControllerOwner): OverlayController {
  return Object.freeze({
    open(options: OverlayOpenOptions) {
      if (!owner.active) {
        throw new Error(
          'Cannot open an Overlay entry from an unmounted useOverlayController owner.',
        )
      }

      const binding = owner.binding
      if (!binding) {
        throw new Error('useOverlayController must be used inside a root TsukiProvider.')
      }

      const registry = owner.registry
      const id = registry.mount({
        content: options.content,
        mask: options.mask,
        transition: options.transition,
        accessibility: options.accessibility,
        onTransitionProgress: options.onTransitionProgress,
        backBehavior: options.backBehavior,
        onBack: options.onBack,
        onEntered: options.onEntered,
        onExited: options.onExited,
        busy: options.busy,
        visible: true,
        theme: binding.theme,
        themeScope: binding.themeScope,
      })

      let entry: OwnedEntry
      const handle = Object.freeze({
        id,
        update(patch: OverlayControllerUpdate) {
          if (!owner.active || entry.released) return false
          if (!findEntry(owner, entry)) return false
          return registry.update(id, patch as OverlayUpdate)
        },
        close() {
          if (!owner.active || entry.released) return false
          const current = findEntry(owner, entry)
          if (!current || current.phase === 'hidden' || current.phase === 'exiting') return false
          return registry.update(id, { visible: false })
        },
      })
      entry = { id, registry, handle, released: false }
      owner.entries.set(id, entry)
      observeEntries(owner)
      return handle
    },
  })
}

export function releaseOverlayControllerOwner(owner: OverlayControllerOwner) {
  if (!owner.active) return
  owner.active = false
  owner.unsubscribe?.()
  owner.unsubscribe = null

  for (const entry of owner.entries.values()) {
    entry.released = true
    const current = entry.registry.getSnapshot().find((candidate) => candidate.id === entry.id)
    if (current && current.phase !== 'hidden' && current.phase !== 'exiting') {
      entry.registry.update(entry.id, { visible: false })
    }
  }

  owner.entries.clear()
}

function findEntry(owner: OverlayControllerOwner, entry: OwnedEntry) {
  if (entry.released) return undefined
  const current = entry.registry.getSnapshot().find((candidate) => candidate.id === entry.id)
  if (!current) forgetEntry(owner, entry)
  return current
}

function observeEntries(owner: OverlayControllerOwner) {
  if (!owner.unsubscribe) {
    owner.unsubscribe = owner.registry.subscribe(() => {
      for (const entry of owner.entries.values()) findEntry(owner, entry)
      stopObservingWhenIdle(owner)
    })
  }

  for (const entry of owner.entries.values()) findEntry(owner, entry)
  stopObservingWhenIdle(owner)
}

function forgetEntry(owner: OverlayControllerOwner, entry: OwnedEntry) {
  entry.released = true
  owner.entries.delete(entry.id)
  stopObservingWhenIdle(owner)
}

function stopObservingWhenIdle(owner: OverlayControllerOwner) {
  if (owner.entries.size !== 0) return
  owner.unsubscribe?.()
  owner.unsubscribe = null
}
