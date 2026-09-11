import { useCallback } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { View } from 'react-native'
import type { StyleProp, TextStyle } from 'react-native'
import { Cell } from '../cell'
import type { CellStyles } from '../cell'
import { resolveStyles } from '../style'
import { Text } from '../text'
import { useComponentToken, useToken } from '../theme'
import { getFieldStyles, getFieldStatusColor, getFieldToken } from './style'
import type { FieldControlContext, FieldProps, FieldStyleState } from './types'
import { useFieldValue } from './use-field-value'

function isVisible(value: ReactNode): boolean {
  return value !== null && value !== undefined && value !== false && value !== ''
}

function renderFeedback(value: ReactNode, style: StyleProp<TextStyle>) {
  if (!isVisible(value)) return null
  if (typeof value === 'string' || typeof value === 'number') {
    return <Text style={style}>{value}</Text>
  }
  return value
}

export function Field<Value = unknown>(props: FieldProps<Value>): ReactElement | null {
  const {
    children,
    label,
    labelExtra,
    value,
    defaultValue,
    onChange,
    valueExtra,
    extra,
    required = false,
    disabled = false,
    readOnly = false,
    vertical = false,
    labelWidth,
    labelAlign = 'left',
    valueAlign = 'right',
    description,
    errorMessage,
    status,
    icon,
    isLink = false,
    clickable,
    arrowDirection,
    onPress,
    border = true,
    style,
    styles,
  } = props
  const { token } = useToken()
  const fieldToken = useComponentToken('Field', getFieldToken)
  const effectiveStatus = status ?? (isVisible(errorMessage) ? 'error' : 'default')
  const state: FieldStyleState = { status: effectiveStatus }
  const semantic = resolveStyles(styles, { props: props as FieldProps<unknown>, state })
  const resolved = getFieldStyles(fieldToken, token, { labelAlign }, state)
  const { currentValue, setValue } = useFieldValue({ value, defaultValue, onChange })
  const handleChange = useCallback(
    (nextValue: Value) => {
      if (disabled || readOnly) return
      setValue(nextValue)
    },
    [disabled, readOnly, setValue],
  )
  const effectiveLabelWidth = labelWidth ?? fieldToken.defaultLabelWidth
  const hasFeedback = isVisible(description) || isVisible(errorMessage)
  const cellStyles: CellStyles = () => ({
    titleArea: vertical
      ? {
          width: '100%',
          flex: undefined,
          marginRight: undefined,
        }
      : {
          width: effectiveLabelWidth,
          flex: 0,
          flexShrink: 0,
          marginRight: fieldToken.labelGap,
        },
    title: [resolved.label, semantic?.label],
    titleExtra: [resolved.labelExtra, semantic?.labelExtra],
    valueArea: vertical
      ? { width: '100%' }
      : {
          flex: 1,
          minWidth: 0,
        },
  })
  const controlContext: FieldControlContext<Value> = {
    value: currentValue,
    onChange: handleChange,
    disabled,
    readOnly,
    status: effectiveStatus,
  }
  const control = typeof children === 'function' ? children(controlContext) : children

  return (
    <Cell
      icon={icon}
      title={label}
      titleExtra={labelExtra}
      value={
        <View style={[{ flex: 1, minWidth: 0 }, resolved.control, semantic?.control]}>
          {control}
          {hasFeedback ? (
            <View style={[resolved.feedback, semantic?.feedback]}>
              {renderFeedback(description, [resolved.description, semantic?.description])}
              {renderFeedback(errorMessage, [
                resolved.error,
                semantic?.error,
                effectiveStatus === 'default'
                  ? undefined
                  : { color: getFieldStatusColor(fieldToken, effectiveStatus) },
              ])}
            </View>
          ) : null}
        </View>
      }
      valueExtra={valueExtra}
      extra={extra}
      vertical={vertical}
      valueAlign={valueAlign}
      required={required}
      isLink={isLink}
      clickable={clickable}
      arrowDirection={arrowDirection}
      onPress={onPress}
      disabled={disabled}
      border={border}
      style={[resolved.root, semantic?.root, style]}
      styles={cellStyles}
    />
  )
}

Field.displayName = 'Field'
