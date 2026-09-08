import { Children, useMemo } from 'react'
import { View } from 'react-native'
import { useComponentToken } from '../theme'
import { CheckboxGroupContext } from './context'
import { useCheckboxGroup } from './state'
import { getCheckboxToken } from './token'
import type { CheckboxGroupProps } from './interface'

export function CheckboxGroup({
  children,
  value,
  defaultValue,
  disabled = false,
  direction = 'vertical',
  gap,
  onChange,
  style,
  ...viewProps
}: CheckboxGroupProps) {
  const token = useComponentToken('Checkbox', getCheckboxToken)
  const { selectedValue, toggle } = useCheckboxGroup({
    value,
    defaultValue,
    disabled,
    onChange,
  })
  const contextValue = useMemo(
    () => ({ value: selectedValue, disabled, toggle }),
    [disabled, selectedValue, toggle],
  )

  return (
    <CheckboxGroupContext.Provider value={contextValue}>
      <View
        {...viewProps}
        accessibilityState={{ ...viewProps.accessibilityState, disabled }}
        style={[
          {
            alignItems: direction === 'horizontal' ? 'center' : 'flex-start',
            flexDirection: direction === 'horizontal' ? 'row' : 'column',
            gap: gap ?? token.groupGap,
          },
          style,
        ]}
      >
        {Children.toArray(children)}
      </View>
    </CheckboxGroupContext.Provider>
  )
}
