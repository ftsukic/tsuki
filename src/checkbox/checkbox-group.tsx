import { Children, isValidElement, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import { View } from 'react-native'
import { Grid } from '../grid'
import { normalizeSelectionButtonColumns } from '../selection/selection-button-style'
import { useComponentToken } from '../theme'
import { Checkbox } from './checkbox'
import { CheckboxGroupContext } from './context'
import { useCheckboxGroup } from './state'
import { getCheckboxToken } from './token'
import type { CheckboxGroupProps, CheckboxOption, CheckboxProps } from './types'

function warnOptionsAndChildren() {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.error('Checkbox.Group accepts either options or children, not both.')
  }
}

function getOptionKey(option: CheckboxOption, index: number) {
  return `${String(option.value)}-${index}`
}

function isButtonCheckbox(child: ReactNode, groupVariant?: CheckboxGroupProps['variant']) {
  if (!isValidElement<CheckboxProps>(child) || child.type !== Checkbox) return false
  return (child.props.variant ?? groupVariant ?? 'default') === 'button'
}

export function CheckboxGroup({
  children,
  options,
  value,
  defaultValue,
  disabled = false,
  variant,
  buttonVariant,
  direction = 'vertical',
  gap,
  buttonLayout = 'intrinsic',
  buttonColumns = 5,
  onChange,
  style,
  ...viewProps
}: CheckboxGroupProps) {
  const token = useComponentToken('Checkbox', getCheckboxToken)
  const warnedConflict = useRef(false)
  const hasChildren = Children.toArray(children).length > 0
  const hasOptions = options !== undefined
  const { selectedValue, toggle } = useCheckboxGroup({
    value,
    defaultValue,
    disabled,
    onChange,
  })

  if (hasChildren && hasOptions && !warnedConflict.current) {
    warnedConflict.current = true
    warnOptionsAndChildren()
  }

  const optionChildren = options?.map((option, index) => (
    <Checkbox key={getOptionKey(option, index)} name={option.value} disabled={option.disabled}>
      {option.label}
    </Checkbox>
  ))
  const content = hasChildren ? children : optionChildren
  const items = Children.toArray(content)
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
      buttonVariant,
      buttonLayout: useEqualButtonGrid ? ('equal' as const) : ('intrinsic' as const),
      toggle,
    }),
    [buttonVariant, disabled, selectedValue, toggle, useEqualButtonGrid, variant],
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
          {content}
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
          {content}
        </View>
      )}
    </CheckboxGroupContext.Provider>
  )
}
