import type { ReactNode } from 'react'
import type { DimensionValue } from 'react-native'
import type { CellProps, CellStyles } from '../cell'
import { Cell } from '../cell'
import { Switch } from '../switch'
import type { SwitchProps } from '../switch'
import { useComponentToken } from '../theme'
import { createFieldCellStyles, getFieldToken } from './style'
import type { FieldCellProps, FieldTitleAlign } from './types'

type SwitchAdapterProps<ActiveValueT, InactiveValueT> = Omit<
  SwitchProps<ActiveValueT, InactiveValueT>,
  | 'value'
  | 'defaultValue'
  | 'activeValue'
  | 'inactiveValue'
  | 'onChange'
  | 'onPress'
  | 'disabled'
  | 'style'
  | 'styles'
>

export interface FieldSwitchProps<ActiveValueT = boolean, InactiveValueT = boolean>
  extends FieldCellProps, SwitchAdapterProps<ActiveValueT, InactiveValueT> {
  title?: ReactNode
  titleExtra?: ReactNode
  label?: ReactNode
  value?: ActiveValueT | InactiveValueT
  defaultValue?: ActiveValueT | InactiveValueT
  activeValue?: ActiveValueT
  inactiveValue?: InactiveValueT
  onChange?: (value: ActiveValueT | InactiveValueT) => void
  disabled?: boolean
  readOnly?: boolean
  titleWidth?: DimensionValue
  titleAlign?: FieldTitleAlign
  style?: CellProps['style']
  cellStyles?: CellStyles
  switchOnPress?: SwitchProps<ActiveValueT, InactiveValueT>['onPress']
  switchStyle?: SwitchProps<ActiveValueT, InactiveValueT>['style']
  switchStyles?: SwitchProps<ActiveValueT, InactiveValueT>['styles']
}

export function FieldSwitch<const ActiveValueT = boolean, const InactiveValueT = boolean>(
  props: FieldSwitchProps<ActiveValueT, InactiveValueT>,
) {
  const {
    title,
    titleExtra,
    label,
    value,
    defaultValue,
    activeValue,
    inactiveValue,
    onChange,
    beforeChange,
    loading,
    disabled = false,
    readOnly = false,
    switchOnPress,
    switchStyle,
    switchStyles,
    pointerEvents,
    valueExtra,
    extra,
    required,
    vertical,
    titleWidth,
    titleAlign,
    valueAlign,
    icon,
    isLink,
    clickable,
    arrowDirection,
    onPress,
    border,
    divider,
    style,
    cellStyles,
    onPressDebounceWait,
    ...switchProps
  } = props

  const fieldToken = useComponentToken('Field', getFieldToken)
  const resolvedCellStyles = createFieldCellStyles(fieldToken, {
    titleWidth,
    titleAlign,
    vertical,
    cellStyles,
  })

  return (
    <Cell
      title={title}
      titleExtra={titleExtra}
      label={label}
      value={
        <Switch
          {...switchProps}
          value={value}
          defaultValue={defaultValue}
          activeValue={activeValue}
          inactiveValue={inactiveValue}
          loading={loading}
          disabled={disabled}
          onPress={switchOnPress}
          onChange={onChange}
          beforeChange={beforeChange}
          pointerEvents={readOnly ? 'none' : pointerEvents}
          style={switchStyle}
          styles={switchStyles}
        />
      }
      valueExtra={valueExtra}
      extra={extra}
      required={required}
      disabled={disabled}
      vertical={vertical}
      valueAlign={valueAlign}
      center={props.center}
      icon={icon}
      isLink={isLink}
      clickable={clickable}
      arrowDirection={arrowDirection}
      onPress={onPress}
      border={border}
      divider={divider}
      style={style}
      onPressDebounceWait={onPressDebounceWait}
      styles={resolvedCellStyles}
    />
  )
}

FieldSwitch.displayName = 'FieldSwitch'
