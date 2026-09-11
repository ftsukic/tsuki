import { forwardRef, useMemo } from 'react'
import { View } from 'react-native'
import type { ReactNode } from 'react'
import type { DimensionValue } from 'react-native'
import type { CellProps, CellStyles } from '../cell'
import { Cell } from '../cell'
import type { InputProps, InputStyleState, InputStyles } from '../input'
import { Input } from '../input'
import { resolveStyles } from '../style'
import { useComponentToken, useToken } from '../theme'
import type { TextInputInstance } from '../text-input'
import { renderFieldFeedback, resolveFieldStatus } from './feedback'
import { createFieldCellStyles, getFieldStyles, getFieldToken } from './style'
import type { FieldLabelAlign, FieldStatus, FieldStyles } from './types'
import { useFieldValue } from './use-field-value'

type FieldInputCellProps = Pick<
  CellProps,
  | 'icon'
  | 'titleExtra'
  | 'valueExtra'
  | 'extra'
  | 'vertical'
  | 'center'
  | 'valueAlign'
  | 'required'
  | 'border'
  | 'isLink'
  | 'clickable'
  | 'arrowDirection'
  | 'onPress'
  | 'onPressDebounceWait'
>

type InputAdapterProps = Omit<
  InputProps,
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'onChangeText'
  | 'onPress'
  | 'disabled'
  | 'readOnly'
  | 'style'
  | 'styles'
>

export interface FieldInputProps extends FieldInputCellProps, InputAdapterProps {
  label?: ReactNode
  labelExtra?: ReactNode
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  disabled?: boolean
  readOnly?: boolean
  labelWidth?: DimensionValue
  labelAlign?: FieldLabelAlign
  description?: ReactNode
  errorMessage?: ReactNode
  status?: FieldStatus
  style?: CellProps['style']
  cellStyles?: CellStyles
  styles?: FieldStyles<FieldInputProps>
  inputStyle?: InputProps['style']
  inputStyles?: InputStyles
}

function createEmbeddedInputStyles(
  inputStyles: InputStyles | undefined,
  valueAlign: NonNullable<FieldInputProps['valueAlign']>,
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

export const FieldInput = forwardRef<TextInputInstance, FieldInputProps>(
  function FieldInput(props, ref) {
    const {
      label,
      labelExtra,
      value,
      defaultValue,
      onChange,
      valueExtra,
      extra,
      required,
      disabled,
      readOnly,
      vertical,
      labelWidth,
      labelAlign,
      valueAlign,
      description,
      errorMessage,
      status,
      icon,
      isLink,
      clickable,
      arrowDirection,
      onPress,
      border,
      style,
      styles,
      inputStyle,
      inputStyles,
      cellStyles,
      ...inputControlProps
    } = props
    const { token } = useToken()
    const fieldToken = useComponentToken('Field', getFieldToken)
    const effectiveStatus = resolveFieldStatus(status, errorMessage)
    const state = { status: effectiveStatus }
    const semantic = resolveStyles(styles, { props, state })
    const resolved = getFieldStyles(fieldToken, token, state)
    const resolvedValueAlign = valueAlign ?? (vertical ? 'left' : 'right')
    const { currentValue, setValue } = useFieldValue({ value, defaultValue, onChange })
    const embeddedInputStyles = useMemo(
      () => createEmbeddedInputStyles(inputStyles, resolvedValueAlign),
      [inputStyles, resolvedValueAlign],
    )
    const resolvedCellStyles = createFieldCellStyles(fieldToken, {
      labelWidth,
      labelAlign,
      vertical,
      cellStyles,
    })

    return (
      <Cell
        title={label}
        titleExtra={labelExtra}
        value={
          <View style={[{ flex: 1, minWidth: 0 }, resolved.control, semantic?.control]}>
            <Input
              {...inputControlProps}
              value={currentValue ?? ''}
              onChangeText={setValue}
              bordered={false}
              disabled={disabled}
              readOnly={readOnly}
              textAlign={inputControlProps.textAlign ?? resolvedValueAlign}
              ref={ref}
              style={inputStyle}
              styles={embeddedInputStyles}
            />
            {renderFieldFeedback(description, errorMessage, resolved, semantic)}
          </View>
        }
        valueExtra={valueExtra}
        extra={extra}
        required={required}
        disabled={disabled}
        vertical={vertical}
        valueAlign={resolvedValueAlign}
        center={props.center}
        icon={icon}
        isLink={isLink}
        clickable={clickable}
        arrowDirection={arrowDirection}
        onPress={onPress}
        border={border}
        style={style}
        onPressDebounceWait={props.onPressDebounceWait}
        styles={resolvedCellStyles}
      />
    )
  },
)

FieldInput.displayName = 'FieldInput'
