import { CheckboxIcon } from '../checkbox'
import { Icon } from '../icon'
import { useToken } from '../theme'
import type { TreeItemProps } from './interface'
import { Pressable, Text, View } from 'react-native'

export function TreeItem({
  tier,
  indent,
  switcherIcon,
  active,
  activeColor,
  multiple,
  label,
  renderLabel,
  labelHighlight,
  hasChildren,
  onPressSwitcherIcon,
  switcherHighlight = true,
  bold,
  disabled,
  ...props
}: TreeItemProps) {
  const { components, token: themeToken } = useToken()
  const token = components.Tree
  const labelNode = renderLabel ? (
    renderLabel({ label, disabled, labelHighlight, active, activeColor })
  ) : (
    <Text
      numberOfLines={1}
      style={{
        flex: 1,
        marginHorizontal: token.labelMarginHorizontal,
        color:
          disabled && !hasChildren
            ? token.disabledTextColor
            : labelHighlight || active
              ? activeColor
              : token.textColor,
        fontWeight: bold ? 'bold' : undefined,
      }}
    >
      {label}
    </Text>
  )
  return (
    <Pressable
      {...props}
      disabled={disabled}
      style={({ pressed }) => [
        {
          minHeight: token.rowHeight,
          paddingHorizontal: token.rowPaddingHorizontal,
          flexDirection: 'row',
          alignItems: 'center',
        },
        pressed && { backgroundColor: token.rowActiveBackgroundColor },
      ]}
    >
      {hasChildren ? (
        <Pressable
          onPress={onPressSwitcherIcon}
          hitSlop={themeToken.sizeSM}
          style={({ pressed }) => [
            {
              width: tier * indent + token.switcherWidth,
              alignItems: 'center',
              justifyContent: 'center',
              padding: switcherHighlight ? token.switcherPadding : 0,
              backgroundColor: switcherHighlight
                ? token.switcherHighlightBackgroundColor
                : undefined,
              borderRadius: token.switcherBorderRadius,
            },
            pressed && { opacity: token.activeOpacity },
          ]}
        >
          {switcherIcon ?? (
            <Icon name="RightOutlined" size={themeToken.fontSizeLG} color={activeColor} />
          )}
        </Pressable>
      ) : (
        <View style={{ width: tier * indent + token.switcherWidth }} />
      )}
      {labelNode}
      {multiple ? (
        <CheckboxIcon active={active} activeColor={activeColor} disabled={disabled} />
      ) : active ? (
        <Icon name="CheckOutlined" color={activeColor} />
      ) : null}
    </Pressable>
  )
}
