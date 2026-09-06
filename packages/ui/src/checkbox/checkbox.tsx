import { useControllableValue } from '../hooks'
import { useToken } from '../theme'
import CheckboxIcon from './checkbox-icon'
import type { CheckboxProps } from './interface'
import isNil from 'lodash/isNil'
import { Children, cloneElement, isValidElement, memo } from 'react'
import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'

function suppressTextHighlighting(node: ReactNode): ReactNode {
  return Children.map(node, (child) => {
    if (!isValidElement<{ children?: ReactNode }>(child)) return child

    const children = child.props.children
    const nextChildren = children === undefined ? children : suppressTextHighlighting(children)

    return cloneElement(child, {
      ...(children === undefined ? {} : { children: nextChildren }),
      ...(child.type === Text ? { suppressHighlighting: true } : {}),
    })
  })
}

function Checkbox<ActiveValue = boolean, InactiveValue = boolean>({
  activeValue = true as ActiveValue,
  inactiveValue = false as InactiveValue,
  label,
  renderLabel,
  children,
  labelDisabled = false,
  labelPosition = 'right',
  iconSize,
  shape = 'square',
  disabled = false,
  activeColor,
  inactiveColor,
  gap,
  labelTextStyle,
  iconStyle,
  renderIcon,
  style,
  ...props
}: CheckboxProps<ActiveValue, InactiveValue>) {
  const { components } = useToken()
  const token = components.Checkbox
  const resolvedIconSize = iconSize ?? token.size
  const resolvedActiveColor = activeColor ?? token.checkedBackgroundColor
  const resolvedInactiveColor = inactiveColor ?? token.borderColor
  const resolvedGap = gap ?? token.gap
  const [value, setValue] = useControllableValue<ActiveValue | InactiveValue>(props, {
    defaultValue: inactiveValue,
  })
  const active = value === activeValue
  const toggle = () => {
    if (!disabled) setValue(active ? inactiveValue : activeValue)
  }
  const labelContent = renderLabel ? (
    suppressTextHighlighting(renderLabel())
  ) : typeof label === 'string' || typeof label === 'number' ? (
    <Text
      suppressHighlighting
      style={[{ color: disabled ? token.labelDisabledColor : token.labelColor }, labelTextStyle]}
    >
      {label}
    </Text>
  ) : (
    label
  )
  const labelNode =
    !isNil(label) || renderLabel ? (
      <Pressable
        disabled={labelDisabled || disabled}
        onPress={toggle}
        style={({ pressed }) => [{ flexShrink: 1 }, pressed && { opacity: token.activeOpacity }]}
      >
        {labelContent}
      </Pressable>
    ) : (
      children
    )
  const iconProps = {
    active,
    activeColor: resolvedActiveColor,
    inactiveColor: resolvedInactiveColor,
    size: resolvedIconSize,
    shape,
    disabled,
    style: iconStyle,
    onPress: toggle,
  }
  return (
    <View {...props} style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
      {labelPosition === 'left' ? labelNode : null}
      {labelPosition === 'left' && labelNode ? <View style={{ width: resolvedGap }} /> : null}
      {renderIcon ? renderIcon(iconProps) : <CheckboxIcon {...iconProps} />}
      {labelPosition === 'right' && labelNode ? <View style={{ width: resolvedGap }} /> : null}
      {labelPosition === 'right' ? labelNode : null}
    </View>
  )
}

export default memo(Checkbox) as typeof Checkbox
