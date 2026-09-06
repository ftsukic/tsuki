import type { PopupProps } from '../popup'
import type { TreeOption, TreeProps, TreeValue } from '../tree'
import type { ReactNode } from 'react'

export type SelectorValue = TreeValue
export type SelectorOption = TreeOption
export interface SelectorProps
  extends
    Omit<PopupProps, 'children' | 'position' | 'onPressOverlay'>,
    Omit<TreeProps, 'value' | 'defaultValue' | 'options' | 'onChange'> {
  value?: SelectorValue | SelectorValue[]
  defaultValue?: SelectorValue | SelectorValue[]
  options: SelectorOption[]
  onChange?: (value: SelectorValue | SelectorValue[], options: SelectorOption[]) => void
  closeOnPressOverlay?: boolean
  title?: ReactNode
  confirmButtonText?: string
  onChangeImmediate?: (value: SelectorValue | SelectorValue[]) => SelectorValue | SelectorValue[]
}
