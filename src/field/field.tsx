import { forwardRef, useMemo, type ForwardedRef, type ReactNode } from 'react'
import { View } from 'react-native'
import type { StyleProp, TextStyle } from 'react-native'
import { Cell } from '../cell'
import type { CellStyles } from '../cell'
import { Input } from '../input'
import type { InputProps, InputStyleState, InputStyles } from '../input'
import { resolveStyles } from '../style'
import { Text } from '../text'
import { useComponentToken, useToken } from '../theme'
import { getFieldStyles, getFieldStatusColor, getFieldToken } from './style'
import type {
  FieldControlContext,
  FieldCustomProps,
  FieldInputProps,
  FieldProps,
  FieldStyleState,
} from './interface'
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

function createEmbeddedInputStyles(
  inputStyles: InputStyles | undefined,
  valueAlign: NonNullable<FieldProps['valueAlign']>,
): InputStyles {
  return ({ props, state }: { props: InputProps; state: InputStyleState }) => {
    const custom = resolveStyles(inputStyles, { props, state })
    const isTextarea = props.multiline === true

    return {
      root: [{ width: '100%', flex: 1 }, custom?.root],
      shell: [
        {
          paddingHorizontal: 0,
          borderWidth: 0,
          borderRadius: 0,
          backgroundColor: 'transparent',
        },
        isTextarea ? undefined : { height: undefined, minHeight: undefined },
        custom?.shell,
      ],
      content: [isTextarea ? undefined : { alignItems: 'center' }, custom?.content],
      input: [
        isTextarea
          ? { textAlign: props.textAlign ?? valueAlign }
          : {
              paddingVertical: 0,
              textAlignVertical: 'center',
              textAlign: props.textAlign ?? valueAlign,
            },
        custom?.input,
      ],
      prefix: custom?.prefix,
      suffix: custom?.suffix,
      clear: custom?.clear,
      wordLimit: custom?.wordLimit,
      addonBefore: custom?.addonBefore,
      addonAfter: custom?.addonAfter,
    }
  }
}

function isCustomFieldProps<Value>(props: FieldProps<Value>): props is FieldCustomProps<Value> {
  return props.children !== undefined
}

function getControl<Value>(
  props: FieldCustomProps<Value>,
  context: FieldControlContext<Value>,
): ReactNode {
  return typeof props.children === 'function' ? props.children(context) : props.children
}

function renderDefaultInput(
  props: FieldInputProps,
  value: string | undefined,
  onChange: (value: string) => void,
  ref: ForwardedRef<React.ComponentRef<typeof Input>>,
  embeddedInputStyles: InputStyles,
) {
  const inputProps = props.inputProps ?? {}
  const valueAlign = props.valueAlign ?? 'right'

  return (
    <Input
      {...inputProps}
      value={value ?? ''}
      onChangeText={onChange}
      bordered={false}
      disabled={props.disabled}
      readOnly={props.readOnly}
      textAlign={inputProps.textAlign ?? valueAlign}
      ref={ref}
      style={props.inputStyle}
      styles={embeddedInputStyles}
    />
  )
}

function FieldImpl<Value>(
  props: FieldProps<Value>,
  ref: ForwardedRef<React.ComponentRef<typeof Input>>,
) {
  const {
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
  const customProps = isCustomFieldProps(props) ? props : undefined
  const inputStyles = !customProps ? props.inputStyles : undefined
  const { token } = useToken()
  const fieldToken = useComponentToken('Field', getFieldToken)
  const effectiveStatus = status ?? (isVisible(errorMessage) ? 'error' : 'default')
  const state: FieldStyleState = { status: effectiveStatus }
  const fieldProps = props as FieldProps<unknown>
  const semantic = resolveStyles(styles, { props: fieldProps, state })
  const resolved = getFieldStyles(fieldToken, token, { labelAlign }, state)
  const { currentValue, setValue } = useFieldValue<unknown>({
    value: value as unknown,
    defaultValue: defaultValue as unknown,
    onChange: onChange as ((value: unknown) => void) | undefined,
  })
  const embeddedInputStyles = useMemo(
    () => createEmbeddedInputStyles(inputStyles, valueAlign),
    [inputStyles, valueAlign],
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
    value: currentValue as Value | undefined,
    onChange: setValue as (value: Value) => void,
    disabled,
    readOnly,
    status: effectiveStatus,
  }
  const control = customProps
    ? getControl(customProps, controlContext)
    : renderDefaultInput(
        props as FieldInputProps,
        currentValue as string | undefined,
        setValue as (value: string) => void,
        ref,
        embeddedInputStyles,
      )

  return (
    <Cell
      icon={icon}
      title={label}
      titleExtra={labelExtra}
      value={
        <View
          style={[
            customProps ? undefined : { flex: 1, minWidth: 0 },
            resolved.control,
            semantic?.control,
          ]}
        >
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

const FieldComponent = forwardRef(FieldImpl)

export const Field = FieldComponent as <Value = string>(
  props: FieldProps<Value> & React.RefAttributes<React.ComponentRef<typeof Input>>,
) => React.ReactElement | null

FieldComponent.displayName = 'Field'
