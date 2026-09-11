import { Children, isValidElement, useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { View } from 'react-native'
import { Grid } from '../grid'
import { normalizeSelectionButtonColumns } from '../selection/selection-button-style'
import { useComponentToken } from '../theme'
import { RadioGroupContext } from './context'
import { Radio } from './radio'
import { getRadioToken } from './token'
import type { RadioGroupProps, RadioOption, RadioProps, RadioValue } from './interface'

function warnOptionsAndChildren() {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.error('Radio.Group accepts either options or children, not both.')
  }
}

function getOptionKey(option: RadioOption, index: number) {
  return `${String(option.value)}-${index}`
}

function isButtonRadio(child: ReactNode, groupVariant?: RadioGroupProps['variant']) {
  if (!isValidElement<RadioProps>(child) || child.type !== Radio) return false
  return (child.props.variant ?? groupVariant ?? 'default') === 'button'
}

export function RadioGroup({
  children,
  options,
  value,
  defaultValue,
  disabled = false,
  variant,
  direction = 'vertical',
  gap,
  buttonLayout = 'intrinsic',
  buttonColumns = 5,
  onChange,
  style,
  ...viewProps
}: RadioGroupProps) {
  const token = useComponentToken('Radio', getRadioToken)
  const [uncontrolledValue, setUncontrolledValue] = useState<RadioValue | undefined>(defaultValue)
  const warnedConflict = useRef(false)
  const hasChildren = Children.toArray(children).length > 0
  const hasOptions = options !== undefined
  const isControlled = value !== undefined
  const selectedValue = isControlled ? value : uncontrolledValue

  if (hasChildren && hasOptions && !warnedConflict.current) {
    warnedConflict.current = true
    warnOptionsAndChildren()
  }

  const select = useCallback(
    (nextValue: RadioValue) => {
      if (Object.is(selectedValue, nextValue)) return false
      if (!isControlled) setUncontrolledValue(nextValue)
      onChange?.(nextValue)
      return true
    },
    [isControlled, onChange, selectedValue],
  )

  const optionChildren = options?.map((option, index) => (
    <Radio key={getOptionKey(option, index)} value={option.value} disabled={option.disabled}>
      {option.label}
    </Radio>
  ))
  const content = hasChildren ? children : optionChildren
  const items = Children.toArray(content)
  const resolvedGap = gap ?? token.gap
  const normalizedButtonColumns = normalizeSelectionButtonColumns(buttonColumns)
  const useEqualButtonGrid =
    buttonLayout === 'equal' &&
    items.length > 0 &&
    items.every((item) => isButtonRadio(item, variant))
  const resolvedColumns =
    direction === 'horizontal' ? Math.min(items.length || 1, normalizedButtonColumns) : 1
  const contextValue = useMemo(
    () => ({
      value: selectedValue,
      disabled,
      variant,
      buttonLayout: useEqualButtonGrid ? ('equal' as const) : ('intrinsic' as const),
      select,
    }),
    [disabled, select, selectedValue, useEqualButtonGrid, variant],
  )

  return (
    <RadioGroupContext.Provider value={contextValue}>
      {useEqualButtonGrid ? (
        <Grid
          {...viewProps}
          accessibilityRole="radiogroup"
          accessibilityState={{ ...viewProps.accessibilityState, disabled }}
          border={false}
          center={false}
          columnNum={resolvedColumns}
          gutter={resolvedGap}
          style={[{ width: '100%' }, style]}
        >
          {content}
        </Grid>
      ) : (
        <View
          {...viewProps}
          accessibilityRole="radiogroup"
          accessibilityState={{ ...viewProps.accessibilityState, disabled }}
          style={[
            {
              flexDirection: direction === 'horizontal' ? 'row' : 'column',
              alignItems: direction === 'horizontal' ? 'center' : 'flex-start',
              gap: resolvedGap,
            },
            style,
          ]}
        >
          {content}
        </View>
      )}
    </RadioGroupContext.Provider>
  )
}
