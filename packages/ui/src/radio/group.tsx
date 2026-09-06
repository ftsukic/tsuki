import { Children, isValidElement, useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { View } from 'react-native'
import { useComponentToken } from '../theme'
import { RadioButton } from './button'
import { RadioGroupContext } from './context'
import { Radio } from './radio'
import { getRadioToken } from './token'
import type {
  RadioGroupProps,
  RadioOption,
  RadioOptionType,
  RadioProps,
  RadioValue,
} from './interface'

function warnOptionsAndChildren() {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.error('Radio.Group accepts either options or children, not both.')
  }
}

function getOptionKey(option: RadioOption, index: number) {
  return `${String(option.value)}-${index}`
}

function getChildOptionType(child: ReactNode, groupOptionType: RadioOptionType): RadioOptionType {
  if (!isValidElement(child)) return groupOptionType
  if (child.type === RadioButton) return 'button'
  return (child.props as RadioProps).optionType ?? groupOptionType
}

export function RadioGroup({
  children,
  options,
  value,
  defaultValue,
  disabled = false,
  direction,
  optionType = 'default',
  buttonStyle = 'outline',
  size = 'middle',
  gap,
  block = false,
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
  const contentChildren = Children.toArray(content)
  const childOptionTypes = contentChildren.map((child) => getChildOptionType(child, optionType))
  const hasButtonType = childOptionTypes.some((type) => type === 'button')
  const resolvedGap = gap ?? (hasButtonType ? 0 : token.gap)
  const resolvedDirection = direction ?? (hasButtonType ? 'horizontal' : 'vertical')
  const contextValue = useMemo(
    () => ({
      value: selectedValue,
      disabled,
      optionType,
      buttonStyle,
      size,
      block,
      first: true,
      last: true,
      select,
    }),
    [block, buttonStyle, disabled, optionType, select, selectedValue, size],
  )

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <View
        {...viewProps}
        accessibilityRole="radiogroup"
        accessibilityState={{ ...viewProps.accessibilityState, disabled }}
        style={[
          {
            flexDirection: resolvedDirection === 'horizontal' ? 'row' : 'column',
            flexWrap: 'nowrap',
            alignItems:
              resolvedDirection === 'horizontal' ? 'center' : block ? 'stretch' : 'flex-start',
            alignSelf: block ? 'stretch' : 'flex-start',
            gap: resolvedGap,
          },
          style,
        ]}
      >
        {contentChildren.map((child, index) => (
          <RadioGroupContext.Provider
            key={isValidElement(child) && child.key != null ? child.key : index}
            value={{
              ...contextValue,
              first: index === 0,
              last: index === contentChildren.length - 1,
              previousOptionType: childOptionTypes[index - 1],
            }}
          >
            {child}
          </RadioGroupContext.Provider>
        ))}
      </View>
    </RadioGroupContext.Provider>
  )
}
