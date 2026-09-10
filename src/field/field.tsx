import { resolveStyles } from '../style'
import { useComponentToken, useToken } from '../theme'
import { Cell } from '../cell'
import type { CellStyles } from '../cell'
import { Input } from '../input'
import type { InputProps, InputStyleState, InputStyles } from '../input'
import { getFieldStyles, getFieldToken } from './style'
import type { FieldProps, FieldSemanticStyles, FieldStyleState } from './interface'
import { forwardRef, useMemo, type ReactNode } from 'react'
import { Text, View } from 'react-native'
import type { StyleProp, TextStyle } from 'react-native'
import type { TextInputInstance } from '../text-input'

function isVisible(value: ReactNode): boolean {
  return value !== null && value !== undefined && value !== false && value !== ''
}

function renderLabel(
  label: ReactNode,
  colon: boolean,
  styles: ReturnType<typeof getFieldStyles>,
  semantic: FieldSemanticStyles | undefined,
) {
  if (!isVisible(label)) return null

  if (typeof label === 'string' || typeof label === 'number') {
    return (
      <View style={[styles.labelContainer, semantic?.labelContainer]}>
        <Text style={[styles.label, semantic?.label]}>
          {label}
          {colon ? ':' : null}
        </Text>
      </View>
    )
  }

  const labelStyle: StyleProp<TextStyle> = [styles.label, semantic?.label]
  const labelContent = (
    <View style={styles.customLabel}>
      {label}
      {colon ? <Text style={labelStyle}>:</Text> : null}
    </View>
  )

  return <View style={[styles.labelContainer, semantic?.labelContainer]}>{labelContent}</View>
}

function renderFeedback(value: ReactNode, style: StyleProp<TextStyle>) {
  if (!isVisible(value)) return null
  if (typeof value === 'string' || typeof value === 'number')
    return <Text style={style}>{value}</Text>
  return value
}

function createEmbeddedInputStyles(inputStyles: InputStyles | undefined): InputStyles {
  if (inputStyles === undefined) return { shell: { paddingHorizontal: 0 } }

  return ({ props, state }: { props: InputProps; state: InputStyleState }) => {
    const semantic = resolveStyles(inputStyles, { props, state })

    return {
      ...semantic,
      shell: [semantic?.shell, { paddingHorizontal: 0 }],
    }
  }
}

export const Field = forwardRef<TextInputInstance, FieldProps>(function Field(
  {
    children,
    label,
    required = false,
    description,
    errorMessage,
    status,
    labelWidth,
    labelAlign = 'left',
    colon = false,
    inputStyle,
    inputStyles,
    style,
    styles,
    ...inputProps
  },
  ref,
) {
  const { token } = useToken()
  const fieldToken = useComponentToken('Field', getFieldToken)
  const effectiveStatus = status ?? (isVisible(errorMessage) ? 'error' : 'default')
  const state: FieldStyleState = { status: effectiveStatus }
  const fieldProps: FieldProps = {
    ...inputProps,
    children,
    label,
    required,
    description,
    errorMessage,
    status,
    labelWidth,
    labelAlign,
    colon,
    inputStyle,
    inputStyles,
    style,
    styles,
  }
  const resolved = getFieldStyles(
    fieldToken,
    token,
    {
      labelAlign,
      labelWidth,
      multiline: inputProps.multiline,
      size: inputProps.size,
    },
    state,
  )
  const semantic = resolveStyles(styles, { props: fieldProps, state })
  const embeddedInputStyles = useMemo(() => createEmbeddedInputStyles(inputStyles), [inputStyles])
  const hasCustomControl = children !== undefined
  const title = renderLabel(label, colon, resolved, semantic)
  const cellStyles: CellStyles = () => ({
    row: [resolved.row, semantic?.row],
    content: {
      flex: 0,
      flexShrink: 0,
      justifyContent: inputProps.multiline ? 'flex-start' : 'center',
      marginRight: token.paddingSM,
      width: labelWidth,
    },
    required: [resolved.required, semantic?.required],
    valueContainer: {
      justifyContent: inputProps.multiline ? 'flex-start' : 'center',
    },
    divider: {
      left: fieldToken.padding,
      right: fieldToken.padding,
    },
  })

  return (
    <Cell
      title={title}
      required={required && isVisible(label)}
      size={inputProps.size === 'large' ? 'large' : 'normal'}
      value={
        <View style={[resolved.content, semantic?.content, semantic?.control]}>
          {hasCustomControl ? (
            children
          ) : (
            <Input
              {...inputProps}
              bordered={inputProps.bordered ?? false}
              ref={ref}
              style={inputStyle}
              styles={embeddedInputStyles}
            />
          )}
          {renderFeedback(description, [resolved.description, semantic?.description])}
          {renderFeedback(errorMessage, [resolved.error, semantic?.error])}
        </View>
      }
      border
      style={[resolved.root, semantic?.root, style]}
      styles={cellStyles}
    />
  )
})

Field.displayName = 'Field'
