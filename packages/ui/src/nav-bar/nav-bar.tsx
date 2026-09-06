import { Divider } from '../divider'
import { Icon } from '../icon'
import { useToken } from '../theme'
import type { NavBarProps } from './interface'
import isNil from 'lodash/isNil'
import { memo } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

export function NavBar({
  testID,
  layout = 'center',
  style,
  theme,
  leftStyle,
  rightStyle,
  showRightIcon = false,
  rightIcon = 'PlusOutlined',
  rightIconSize,
  onPressRightIcon,
  titleTextStyle,
  title,
  titleExtra,
  leftExtra,
  rightExtra,
  showLeftIcon = true,
  leftIcon = 'LeftOutlined',
  leftIconColor,
  leftIconSize,
  divider = true,
  onPressLeftIcon,
}: NavBarProps) {
  const { components } = useToken()
  const token = { ...components.NavBar, ...theme }
  const titleNode = !isNil(titleExtra) ? (
    titleExtra
  ) : isNil(title) ? null : typeof title === 'object' ? (
    title
  ) : (
    <Text
      style={[
        {
          color: token.titleColor,
          fontSize: token.titleFontSize,
          fontWeight: 'bold',
          textAlign: 'center',
        },
        titleTextStyle,
      ]}
    >
      {title}
    </Text>
  )

  const leftButton = showLeftIcon ? (
    <TouchableOpacity
      activeOpacity={token.activeOpacity}
      onPress={onPressLeftIcon}
      hitSlop={{ left: token.arrowSize / 2, right: token.arrowSize / 2 }}
      style={{
        height: token.height,
        minWidth: token.arrowSize,
        justifyContent: 'center',
      }}
    >
      <Icon
        name={leftIcon}
        size={leftIconSize ?? token.arrowSize}
        color={(leftIconColor ?? token.iconColor) as string}
      />
    </TouchableOpacity>
  ) : null

  const leftNode =
    showLeftIcon || !isNil(leftExtra) ? (
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            flexShrink: 0,
          },
          leftStyle,
        ]}
      >
        {leftButton}
        {leftExtra}
      </View>
    ) : null

  const iconNode = showRightIcon ? (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={token.activeOpacity}
      hitSlop={token.arrowSize / 2}
      onPress={onPressRightIcon}
      style={{
        alignItems: 'center',
        height: token.height,
        justifyContent: 'center',
        minWidth: token.arrowSize,
      }}
    >
      <Icon
        name={rightIcon}
        size={rightIconSize ?? token.arrowSize}
        color={token.iconColor as string}
      />
    </TouchableOpacity>
  ) : null

  const rightNode =
    !isNil(rightExtra) || iconNode ? (
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            flexShrink: 0,
            marginLeft: token.gap,
          },
          rightStyle,
        ]}
      >
        {iconNode}
        {rightExtra}
      </View>
    ) : null

  const toolbar =
    layout === 'flex' ? (
      <View
        testID={testID}
        style={[
          {
            height: token.height,
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: token.backgroundColor,
            paddingHorizontal: token.gap,
          },
          style,
        ]}
      >
        {leftNode}
        <View
          style={{
            flex: 1,
            minWidth: 0,
            justifyContent: 'center',
            marginLeft: leftNode ? token.gap : 0,
          }}
        >
          {titleNode}
        </View>
        {rightNode}
      </View>
    ) : (
      <View
        testID={testID}
        style={[
          {
            height: token.height,
            width: '100%',
            justifyContent: 'center',
            position: 'relative',
            backgroundColor: token.backgroundColor,
            paddingHorizontal: token.gap,
          },
          style,
        ]}
      >
        {leftNode ? (
          <View
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: token.gap,
              justifyContent: 'center',
              zIndex: 3,
            }}
          >
            {leftNode}
          </View>
        ) : null}
        {rightNode ? (
          <View
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: token.gap,
              justifyContent: 'center',
              zIndex: 3,
            }}
          >
            {rightNode}
          </View>
        ) : null}
        {titleNode}
      </View>
    )

  return (
    <>
      {toolbar}
      {divider ? <Divider /> : null}
    </>
  )
}

export default memo(NavBar)
