import { createContext } from 'react'
import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import type { DropdownMenuProps, DropdownMenuStyles, DropdownValue } from './types'

export interface DropdownItemRegistration {
  id: symbol
  index: number
  disabled: boolean
  content?: ReactNode
  contentStyle?: StyleProp<ViewStyle>
  overlayStyle?: StyleProp<ViewStyle>
  estimatedHeight?: number
  onOpened?: () => void
  onClosed?: () => void
}

export interface DropdownMenuContextValue {
  activeIndex: number | null
  activeColor: string
  direction: NonNullable<DropdownMenuProps['direction']>
  overlay: boolean
  closeOnPressOverlay: boolean
  duration?: number
  zIndex?: number
  menuProps: DropdownMenuProps
  menuStyles?: DropdownMenuStyles
  registerItem: (id: symbol, disabled: boolean) => number
  updateItem: (id: symbol, item: Partial<DropdownItemRegistration>) => void
  unregisterItem: (id: symbol) => void
  getItem: (index: number | null) => DropdownItemRegistration | undefined
  open: (index: number) => void
  close: () => void
  toggle: (index: number) => void
  notifyPopupOpened: () => void
  notifyPopupClosed: () => void
  notifyItemUpdate: () => void
  itemVersion: number
}

export const DropdownMenuContext = createContext<DropdownMenuContextValue | undefined>(undefined)

export function sameDropdownValue(
  left: DropdownValue | undefined,
  right: DropdownValue | undefined,
) {
  return Object.is(left, right)
}
