import { Children, useCallback, useMemo, useRef, useState } from 'react'
import { View } from 'react-native'
import { useComponentToken } from '../theme'
import { RadioGroupContext } from './context'
import { Radio } from './radio'
import { getRadioToken } from './token'
import type { RadioGroupProps, RadioOption, RadioValue } from './interface'

function warnOptionsAndChildren() {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.error('Radio.Group accepts either options or children, not both.')
  }
}

function getOptionKey(option: RadioOption, index: number) {
  return `${String(option.value)}-${index}`
}

export function RadioGroup({
  children,
  options,
  value,
  defaultValue,
  disabled = false,
  direction = 'vertical',
  gap,
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

  const contextValue = useMemo(
    () => ({ value: selectedValue, disabled, select }),
    [disabled, select, selectedValue],
  )

  const optionChildren = options?.map((option, index) => (
    <Radio key={getOptionKey(option, index)} value={option.value} disabled={option.disabled}>
      {option.label}
    </Radio>
  ))
  const content = hasChildren ? children : optionChildren
  const resolvedGap = gap ?? token.gap

  return (
    <RadioGroupContext.Provider value={contextValue}>
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
    </RadioGroupContext.Provider>
  )
}
