import {
  Children,
  forwardRef,
  isValidElement,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'
import type { ReactNode } from 'react'
import { View } from 'react-native'
import { Grid } from '../grid'
import { normalizeSelectionButtonColumns } from '../selection/selection-button-style'
import { useComponentToken } from '../theme'
import { Checkbox } from './checkbox'
import { CheckboxGroupContext } from './context'
import { useCheckboxGroup } from './state'
import { getCheckboxToken } from './token'
import type {
  CheckboxGroupProps,
  CheckboxGroupRef,
  CheckboxGroupToggleAllOptions,
  CheckboxOption,
  CheckboxProps,
  CheckboxValue,
} from './types'

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

interface CheckboxGroupItem {
  name: CheckboxValue
  disabled: boolean
}

function containsValue(values: readonly CheckboxValue[], value: CheckboxValue) {
  return values.some((item) => Object.is(item, value))
}

function appendUniqueValue(values: CheckboxValue[], value: CheckboxValue) {
  if (!containsValue(values, value)) values.push(value)
}

function getCheckboxItems(content: ReactNode, groupDisabled: boolean): CheckboxGroupItem[] {
  const items: CheckboxGroupItem[] = []

  for (const child of Children.toArray(content)) {
    if (!isValidElement<CheckboxProps>(child) || child.type !== Checkbox) continue
    const name = child.props.name
    if (name === undefined || items.some((item) => Object.is(item.name, name))) continue

    items.push({
      name,
      disabled: groupDisabled || Boolean(child.props.disabled),
    })
  }

  return items
}

function getToggleAllValue(
  selectedValue: readonly CheckboxValue[],
  items: readonly CheckboxGroupItem[],
  options?: boolean | CheckboxGroupToggleAllOptions,
) {
  const checked = typeof options === 'boolean' ? options : options?.checked
  const skipDisabled = typeof options === 'object' && options?.skipDisabled === true
  const nextValue: CheckboxValue[] = []

  for (const value of selectedValue) {
    if (!items.some((item) => Object.is(item.name, value))) appendUniqueValue(nextValue, value)
  }

  for (const item of items) {
    const isChecked = containsValue(selectedValue, item.name)
    const nextChecked = skipDisabled && item.disabled ? isChecked : (checked ?? !isChecked)
    if (nextChecked) appendUniqueValue(nextValue, item.name)
  }

  return nextValue
}

export const CheckboxGroup = forwardRef<CheckboxGroupRef, CheckboxGroupProps>(
  function CheckboxGroup(
    {
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
    },
    ref,
  ) {
    const token = useComponentToken('Checkbox', getCheckboxToken)
    const warnedConflict = useRef(false)
    const hasChildren = Children.toArray(children).length > 0
    const hasOptions = options !== undefined
    const { selectedValue, setSelectedValue, toggle } = useCheckboxGroup({
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
    const checkboxItems = getCheckboxItems(content, disabled)
    const resolvedGap = gap ?? token.groupGap
    const normalizedButtonColumns = normalizeSelectionButtonColumns(buttonColumns)
    const useEqualButtonGrid =
      buttonLayout === 'equal' &&
      items.length > 0 &&
      items.every((item) => isButtonCheckbox(item, variant))
    const resolvedColumns =
      direction === 'horizontal' ? Math.min(items.length || 1, normalizedButtonColumns) : 1

    const toggleAll = useCallback(
      (options?: boolean | CheckboxGroupToggleAllOptions) => {
        setSelectedValue(getToggleAllValue(selectedValue, checkboxItems, options))
      },
      [checkboxItems, selectedValue, setSelectedValue],
    )

    useImperativeHandle(ref, () => ({ toggleAll }), [toggleAll])

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
  },
)

CheckboxGroup.displayName = 'CheckboxGroup'
