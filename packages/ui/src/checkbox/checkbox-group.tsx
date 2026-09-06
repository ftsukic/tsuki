import { useControllableValue } from '../hooks'
import { useToken } from '../theme'
import Checkbox from './checkbox'
import type { CheckboxGroupProps } from './interface'
import { memo } from 'react'
import { ScrollView, View } from 'react-native'

function CheckboxGroup<Value = unknown>({
  options,
  multiple = false,
  editable = true,
  deselect = true,
  scrollable = false,
  direction = 'column',
  wrap = false,
  gap,
  activeColor,
  inactiveColor,
  iconSize,
  shape,
  checkboxLabelTextStyle,
  checkboxIconLabelGap,
  renderIcon,
  style,
  ...props
}: CheckboxGroupProps<Value>) {
  const { components } = useToken()
  const token = components.Checkbox
  const resolvedGroupGap = gap ?? token.groupGap
  const [value, setValue] = useControllableValue<Value | Value[] | undefined>(props, {
    defaultValue: multiple ? [] : undefined,
  })
  const content = (
    <View
      style={[
        { flexDirection: direction, flexWrap: wrap ? 'wrap' : 'nowrap', gap: resolvedGroupGap },
        style,
      ]}
    >
      {options.map((option) => {
        const selected = multiple
          ? (value as Value[] | undefined)?.includes(option.value)
          : value === option.value
        return (
          <Checkbox
            key={`${option.value}`}
            {...option}
            labelTextStyle={option.labelTextStyle ?? checkboxLabelTextStyle}
            gap={option.gap ?? checkboxIconLabelGap ?? token.gap}
            activeColor={option.activeColor ?? activeColor}
            inactiveColor={option.inactiveColor ?? inactiveColor}
            iconSize={option.iconSize ?? iconSize}
            shape={option.shape ?? shape}
            renderIcon={option.renderIcon ?? renderIcon}
            activeValue={option.value}
            inactiveValue={null as Value & null}
            value={selected ? option.value : (null as Value & null)}
            disabled={!editable || option.disabled}
            onChange={(next) => {
              if (!editable || option.disabled) return
              if (multiple) {
                const current = (value as Value[] | undefined) ?? []
                const nextValues =
                  next === option.value
                    ? [option.value, ...current.filter((item) => item !== option.value)]
                    : current.filter((item) => item !== option.value)
                setValue(nextValues)
                props.onChange?.(
                  nextValues,
                  options.filter((item) => nextValues.includes(item.value)),
                )
              } else if (next === option.value || deselect) {
                const nextValue = next === option.value ? next : undefined
                setValue(nextValue)
                props.onChange?.(
                  nextValue,
                  nextValue === undefined ? [] : options.filter((item) => item.value === nextValue),
                )
              }
            }}
          />
        )
      })}
    </View>
  )
  return scrollable && direction === 'row' && !wrap ? (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {content}
    </ScrollView>
  ) : (
    content
  )
}

export default memo(CheckboxGroup) as typeof CheckboxGroup
