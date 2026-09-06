import { Icon } from '../icon'
import { useToken } from '../theme'
import type { CheckboxIconProps } from './interface'
import { memo } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})

function CheckboxIcon({
  active = false,
  activeColor,
  inactiveColor,
  size,
  shape = 'square',
  disabled = false,
  ...props
}: CheckboxIconProps) {
  const { components, token: themeToken } = useToken()
  const token = components.Checkbox
  const resolvedSize = size ?? token.size
  const color = disabled
    ? token.disabledBorderColor
    : active
      ? (activeColor ?? token.checkedBackgroundColor)
      : (inactiveColor ?? token.borderColor)

  return (
    <Pressable {...props} disabled={disabled} hitSlop={props.hitSlop ?? themeToken.sizeSM}>
      <View
        style={[
          styles.box,
          {
            borderWidth: themeToken.lineWidth,
            borderColor: color,
            borderRadius: shape === 'circle' ? resolvedSize / 2 : token.borderRadius,
            height: resolvedSize,
            width: resolvedSize,
          },
          active && { backgroundColor: color },
        ]}
      >
        {active ? (
          <Icon name="CheckOutlined" size={resolvedSize * 0.72} color={token.checkedColor} />
        ) : null}
      </View>
    </Pressable>
  )
}

export default memo(CheckboxIcon)
