import type { TreeMultipleMode } from './multiple-mode'
import type { ReactNode } from 'react'
import type { ColorValue, TouchableOpacityProps } from 'react-native'

export type TreeValue = string | number
export interface TreeOption {
  label: string
  value: TreeValue
  disabled?: boolean
  bold?: boolean
  switcherHighlight?: boolean
  switcherIconRotatable?: boolean
  children?: TreeOption[]
  render?: (props: {
    label: string
    disabled?: boolean
    labelHighlight?: boolean
    active: boolean
    activeColor: ColorValue
  }) => ReactNode
  renderSwitcherIcon?: (props: { color: ColorValue; size: number }) => ReactNode
}
export interface TreeSearchListData extends TreeOption {
  labels: { text: string; highlight: boolean }[]
}
export interface TreeProps {
  multiple?: boolean
  multipleMode?: TreeMultipleMode
  value?: TreeValue | TreeValue[] | null
  defaultValue?: TreeValue | TreeValue[] | null
  onChange?: (
    value: TreeValue | TreeValue[] | null,
    options: TreeOption[],
    event: { checked: boolean; option: TreeOption },
  ) => void
  options: TreeOption[]
  renderSwitcherIcon?: TreeOption['renderSwitcherIcon']
  indent?: number
  activeColor?: ColorValue
  defaultExpandedValues?: TreeValue[]
  defaultExpandAll?: boolean
  search?: boolean
  onSearch?: (keyword: string, options: TreeOption[]) => TreeSearchListData[]
  placeholder?: string
  minHeight?: boolean | number
  cancellable?: boolean
  editable?: boolean
}
export interface TreeItemProps extends TouchableOpacityProps {
  tier: number
  indent: number
  switcherIcon?: ReactNode
  switcherHighlight?: boolean
  active: boolean
  activeColor: ColorValue
  multiple: boolean
  bold?: boolean
  label: string
  renderLabel?: TreeOption['render']
  labelHighlight?: boolean
  hasChildren?: boolean
  onPressSwitcherIcon?: TouchableOpacityProps['onPress']
}
