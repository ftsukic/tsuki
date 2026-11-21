import type { ReactNode } from 'react'
import type { ResolvedTheme } from '../theme/types'
import type { OverlayTransitionConfig } from './transition/types'

export type OverlayBackBehavior = 'dismiss' | 'consume' | 'passthrough'
export type OverlayPhase = 'hidden' | 'entering' | 'entered' | 'exiting'
export type OverlayTransitionProgressListener = (
  channel: 'mask' | 'content',
  progress: number,
  generation: number,
) => void

export interface OverlayEntry {
  readonly id: number
  readonly content: ReactNode
  readonly mask?: ReactNode
  readonly transition?: OverlayTransitionConfig
  readonly onTransitionProgress?: OverlayTransitionProgressListener
  readonly phase: OverlayPhase
  readonly generation: number
  /** Requested visibility; an exiting entry remains rendered until its transition completes. */
  readonly visible: boolean
  /** Compatibility summary for Back handling while an entry is exiting. */
  readonly closing: boolean
  readonly backBehavior: OverlayBackBehavior
  readonly onBack?: () => void
  readonly theme: ResolvedTheme
  readonly themeScope: object
}

export interface OverlayMountOptions {
  content: ReactNode
  backBehavior: OverlayBackBehavior
  onBack?: () => void
  visible?: boolean
  mask?: ReactNode
  transition?: OverlayTransitionConfig
  onTransitionProgress?: OverlayTransitionProgressListener
  theme: ResolvedTheme
  themeScope: object
}

export interface OverlayUpdate {
  content?: ReactNode
  mask?: ReactNode
  transition?: OverlayTransitionConfig
  onTransitionProgress?: OverlayTransitionProgressListener
  visible?: boolean
  closing?: boolean
  backBehavior?: OverlayBackBehavior
  onBack?: (() => void) | undefined
}

export interface OverlayBackResultSnapshot {
  readonly count: number
  readonly consumed: boolean
}

export interface OverlayHostRegistration {
  readonly host: object
  readonly generation: number
}

export interface OverlayRegistry {
  mount(options: OverlayMountOptions): number
  update(id: number, patch: OverlayUpdate): boolean
  unmount(id: number): boolean
  completeEnter(id: number, generation: number): boolean
  completeExit(id: number, generation: number): boolean
  disposeRoot(): void
  subscribe(listener: () => void): () => void
  getSnapshot(): readonly OverlayEntry[]
  registerHost(host: object): OverlayHostRegistration
  unregisterHost(registration: OverlayHostRegistration): boolean
  dispatchBack(): boolean
  updateThemeScope(scope: object, theme: ResolvedTheme): void
  subscribeBackResult(listener: () => void): () => void
  getBackResultSnapshot(): OverlayBackResultSnapshot
}
