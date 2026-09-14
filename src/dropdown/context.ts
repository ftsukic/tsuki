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
  onOpen?: () => void
  onClose?: () => void
  onOpened?: () => void
  onClosed?: () => void
  metadata?: readonly unknown[]
}

export interface DropdownMenuContextValue {
  activeIndex: number | null
  activeItem?: DropdownItemRegistration
  activeColor: string
  direction: NonNullable<DropdownMenuProps['direction']>
  overlay: boolean
  closeOnPressOverlay: boolean
  duration?: number
  panelMaxHeight?: number
  scrollable: boolean
  scrollableItemWidth: `${number}%`
  zIndex?: number
  menuProps: DropdownMenuProps
  menuStyles?: DropdownMenuStyles
  registerItem: (id: symbol, index: number, disabled: boolean) => void
  updateItem: (id: symbol, item: Partial<DropdownItemRegistration>) => void
  unregisterItem: (id: symbol) => void
  open: (index: number) => void
  close: () => void
  toggle: (index: number) => void
  notifyItemUpdate: () => void
  itemVersion: number
}

export const DropdownMenuContext = createContext<DropdownMenuContextValue | undefined>(undefined)

export const DropdownItemPositionContext = createContext<number | null>(null)

export function sameDropdownValue(
  left: DropdownValue | undefined,
  right: DropdownValue | undefined,
) {
  return Object.is(left, right)
}
