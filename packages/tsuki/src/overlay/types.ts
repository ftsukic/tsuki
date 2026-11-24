import type { ReactNode, RefObject } from 'react'
import type { View } from 'react-native'
import type { ResolvedTheme } from '../theme/types'
import type { OverlayTransitionConfig } from './transition/types'

export type OverlayBackBehavior = 'dismiss' | 'consume' | 'passthrough'
export type OverlayPhase = 'hidden' | 'entering' | 'entered' | 'exiting'
export type OverlayAccessibilityMode = 'modal' | 'non-modal'

export interface OverlayAccessibilityConfig {
  mode?: OverlayAccessibilityMode
  initialFocusRef?: RefObject<View | null>
  returnFocusRef?: RefObject<View | null>
}

export interface ResolvedOverlayAccessibilityConfig {
  readonly mode: OverlayAccessibilityMode
  readonly initialFocusRef?: RefObject<View | null>
  readonly returnFocusRef?: RefObject<View | null>
}

export type OverlayTransitionProgressListener = (
  channel: 'mask' | 'content',
  progress: number,
  generation: number,
) => void

export interface OverlayEntry {
  readonly id: number
  readonly order: number
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
  /** Blocks dismiss Back routing while an async guard (e.g. beforeClose) is pending. */
  readonly busy: boolean
  readonly backBehavior: OverlayBackBehavior
  readonly onBack?: () => void
  readonly onEntered?: () => void
  readonly onExited?: () => void
  readonly accessibility: ResolvedOverlayAccessibilityConfig
  readonly theme: ResolvedTheme
  readonly themeScope: object
}

export interface PortalEntry {
  readonly id: number
  readonly order: number
  readonly host: string
  readonly content: ReactNode
  readonly theme: ResolvedTheme
  readonly themeScope: object
}

export interface PortalMountOptions {
  content: ReactNode
  host?: string
  theme: ResolvedTheme
  themeScope: object
}

export interface PortalUpdate {
  content?: ReactNode
  host?: string
  theme?: ResolvedTheme
  themeScope?: object
}

export interface PortalHostRegistration {
  readonly name: string
  readonly host: object
  readonly generation: number
}

export interface OverlayMountOptions {
  content: ReactNode
  backBehavior: OverlayBackBehavior
  onBack?: () => void
  onEntered?: () => void
  onExited?: () => void
  busy?: boolean
  visible?: boolean
  mask?: ReactNode
  transition?: OverlayTransitionConfig
  accessibility?: OverlayAccessibilityConfig
  onTransitionProgress?: OverlayTransitionProgressListener
  theme: ResolvedTheme
  themeScope: object
}

export interface OverlayUpdate {
  content?: ReactNode
  mask?: ReactNode
  transition?: OverlayTransitionConfig
  accessibility?: OverlayAccessibilityConfig | undefined
  onTransitionProgress?: OverlayTransitionProgressListener
  visible?: boolean
  closing?: boolean
  busy?: boolean
  backBehavior?: OverlayBackBehavior
  onBack?: (() => void) | undefined
  onEntered?: (() => void) | undefined
  onExited?: (() => void) | undefined
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
  mountPortal(options: PortalMountOptions): number
  updatePortal(id: number, patch: PortalUpdate): boolean
  unmountPortal(id: number): boolean
  subscribePortals(listener: () => void): () => void
  getPortalSnapshot(): readonly PortalEntry[]
  registerPortalHost(name: string, host: object): PortalHostRegistration
  unregisterPortalHost(registration: PortalHostRegistration): boolean
  registerHost(host: object): OverlayHostRegistration
  unregisterHost(registration: OverlayHostRegistration): boolean
  dispatchBack(): boolean
  updateThemeScope(scope: object, theme: ResolvedTheme): void
  subscribeBackResult(listener: () => void): () => void
  getBackResultSnapshot(): OverlayBackResultSnapshot
}
