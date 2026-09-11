import { Children, isValidElement, useMemo } from 'react'
import type { ReactNode } from 'react'
import { View } from 'react-native'
import { Grid } from '../grid'
import { normalizeSelectionButtonColumns } from '../selection/selection-button-style'
import { useComponentToken } from '../theme'
import { Checkbox } from './Checkbox'
import { CheckboxGroupContext } from './context'
import { useCheckboxGroup } from './state'
import { getCheckboxToken } from './token'
import type { CheckboxGroupProps, CheckboxProps } from './interface'

function isButtonCheckbox(child: ReactNode, groupVariant?: CheckboxGroupProps['variant']) {
  if (!isValidElement<CheckboxProps>(child) || child.type !== Checkbox) return false
  return (child.props.variant ?? groupVariant ?? 'default') === 'button'
}

export function CheckboxGroup({
  children,
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
}: CheckboxGroupProps) {
  const token = useComponentToken('Checkbox', getCheckboxToken)
  const { selectedValue, toggle } = useCheckboxGroup({
    value,
    defaultValue,
    disabled,
    onChange,
  })

  const items = Children.toArray(children)
  const resolvedGap = gap ?? token.groupGap
  const normalizedButtonColumns = normalizeSelectionButtonColumns(buttonColumns)
  const useEqualButtonGrid =
    buttonLayout === 'equal' &&
    items.length > 0 &&
    items.every((item) => isButtonCheckbox(item, variant))
  const resolvedColumns =
    direction === 'horizontal' ? Math.min(items.length || 1, normalizedButtonColumns) : 1

  const contextValue = useMemo(
    () => ({
      value: selectedValue,
      disabled,
      variant,
      buttonLayout: useEqualButtonGrid ? ('equal' as const) : ('intrinsic' as const),
      toggle,
    }),
    [disabled, selectedValue, toggle, useEqualButtonGrid, variant],
  )

  return (
    <CheckboxGroupContext.Provider value={contextValue}>
      {useEqualButtonGrid ? (
        <Grid
          {...viewProps}
          accessibilityState={{ ...viewProps.accessibilityState, disabled }}
          border={false}
          center={false}
          columnNum={resolvedColumns}
          gutter={resolvedGap}
          style={[{ width: '100%' }, style]}
        >
          {children}
        </Grid>
      ) : (
        <View
          {...viewProps}
          accessibilityState={{ ...viewProps.accessibilityState, disabled }}
          style={[
            {
              alignItems: direction === 'horizontal' ? 'center' : 'flex-start',
              flexDirection: direction === 'horizontal' ? 'row' : 'column',
              gap: resolvedGap,
            },
            style,
          ]}
        >
          {children}
        </View>
      )}
    </CheckboxGroupContext.Provider>
  )
}
