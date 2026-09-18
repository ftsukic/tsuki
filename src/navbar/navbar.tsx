import { forwardRef, useContext } from 'react'
import { View } from 'react-native'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import { Icon } from '../icon'
import { Pressable } from '../pressable'
import { resolveStyles } from '../style'
import { Text } from '../text'
import { useComponentToken, useToken } from '../theme'
import { getNavbarStyles } from './style'
import { getNavbarToken } from './token'
import type { NavbarProps, NavbarStyleState } from './types'
import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'

function isTextContent(value: ReactNode): value is string | number {
  return typeof value === 'string' || typeof value === 'number'
}

function NavbarSlot({
  children,
  disabled = false,
  onPress,
  style,
  testID,
}: {
  children: ReactNode
  disabled?: boolean
  onPress?: NavbarProps['onPressLeft']
  style: StyleProp<ViewStyle>
  testID?: string
}) {
  if (onPress === undefined) {
    return (
      <View testID={testID} style={style}>
        {children}
      </View>
    )
  }

  return (
    <Pressable
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      pressStyle="opacity"
      style={style}
    >
      {children}
    </Pressable>
  )
}

export const Navbar = forwardRef<View, NavbarProps>(function Navbar(
  {
    title,
    left,
    right,
    leftArrow = false,
    leftIconSize,
    leftDisabled = false,
    rightDisabled = false,
    leftText,
    rightText,
    onPressLeft,
    onPressRight,
    border = true,
    fixed = false,
    placeholder = false,
    zIndex = 1,
    safeAreaInsetTop = false,
    style,
    styles,
    testID,
    ...viewProps
  },
  ref,
) {
  const token = useComponentToken('Navbar', getNavbarToken)
  const { token: aliasToken } = useToken()
  const safeAreaInsets = useContext(SafeAreaInsetsContext)
  const topInset = safeAreaInsetTop ? Math.max(0, safeAreaInsets?.top ?? 0) : 0
  const props: NavbarProps = {
    title,
    left,
    right,
    leftArrow,
    leftIconSize,
    leftDisabled,
    rightDisabled,
    leftText,
    rightText,
    onPressLeft,
    onPressRight,
    border,
    fixed,
    placeholder,
    zIndex,
    safeAreaInsetTop,
    style,
    styles,
  }
  const state: NavbarStyleState = { leftDisabled, rightDisabled }
  const resolved = getNavbarStyles(token, aliasToken)
  const semantic = resolveStyles(styles, { props, state })
  const leftTestID = testID === undefined ? undefined : `${testID}-left`
  const rightTestID = testID === undefined ? undefined : `${testID}-right`
  const hasCustomLeft = left !== undefined && left !== null
  const hasDefaultLeft = leftArrow || (leftText !== undefined && leftText !== null)
  const hasLeftContent = hasCustomLeft || hasDefaultLeft
  const hasCustomRight = right !== undefined && right !== null
  const hasDefaultRight = rightText !== undefined && rightText !== null
  const hasRightContent = hasCustomRight || hasDefaultRight
  const hasTitle = title !== undefined && title !== null
  const leftTextStyle = {
    color: token.actionColor,
    fontFamily: aliasToken.fontFamily,
    fontSize: token.actionFontSize,
    lineHeight: aliasToken.lineHeight,
  }

  const renderDefaultLeft = () => (
    <>
      {leftArrow ? (
        <Icon
          name="LeftOutlined"
          size={leftIconSize ?? token.iconSize}
          color={token.actionColor}
          style={{ marginRight: aliasToken.paddingXXS }}
        />
      ) : null}
      {leftText != null ? (
        <Text ellipsizeMode="tail" numberOfLines={1} style={[leftTextStyle, { flexShrink: 1 }]}>
          {leftText}
        </Text>
      ) : null}
    </>
  )

  const renderDefaultRight = () => (
    <Text
      ellipsizeMode="tail"
      numberOfLines={1}
      style={{
        color: token.actionColor,
        flexShrink: 0,
        fontFamily: aliasToken.fontFamily,
        fontSize: token.actionFontSize,
        lineHeight: aliasToken.lineHeight,
        maxWidth: '100%',
      }}
    >
      {rightText}
    </Text>
  )

  const renderTitle = () =>
    isTextContent(title) ? (
      <Text
        ellipsizeMode="tail"
        style={[resolved.titleText, semantic?.titleText]}
        numberOfLines={1}
      >
        {title}
      </Text>
    ) : (
      title
    )

  const leftContent = hasCustomLeft ? left : hasDefaultLeft ? renderDefaultLeft() : null
  const rightContent = hasCustomRight ? right : hasDefaultRight ? renderDefaultRight() : null

  return (
    <>
      <View
        ref={ref}
        {...viewProps}
        testID={testID}
        style={[
          resolved.root,
          fixed && { left: 0, position: 'absolute', right: 0, top: 0 },
          { zIndex },
          semantic?.root,
          style,
          safeAreaInsetTop && { paddingTop: topInset },
        ]}
      >
        <View
          testID={testID === undefined ? undefined : `${testID}-bar`}
          style={[resolved.bar, semantic?.bar]}
        >
          {hasLeftContent ? (
            <NavbarSlot
              testID={leftTestID}
              disabled={leftDisabled}
              onPress={onPressLeft}
              style={[resolved.left, semantic?.left]}
            >
              {leftContent}
            </NavbarSlot>
          ) : null}
          {hasTitle ? (
            <View
              testID={testID === undefined ? undefined : `${testID}-title`}
              pointerEvents="none"
              style={[resolved.title, semantic?.title]}
            >
              {renderTitle()}
            </View>
          ) : null}
          {hasRightContent ? (
            <NavbarSlot
              testID={rightTestID}
              disabled={rightDisabled}
              onPress={onPressRight}
              style={[resolved.right, semantic?.right]}
            >
              {rightContent}
            </NavbarSlot>
          ) : null}
        </View>
        {border ? (
          <View
            testID={testID === undefined ? undefined : `${testID}-divider`}
            pointerEvents="none"
            style={[
              {
                backgroundColor: token.borderColor,
                bottom: 0,
                height: aliasToken.lineWidthHairline,
                left: 0,
                position: 'absolute',
                right: 0,
              },
              resolved.divider,
              semantic?.divider,
            ]}
          />
        ) : null}
      </View>
      {fixed && placeholder ? (
        <View
          testID={testID === undefined ? undefined : `${testID}-placeholder`}
          accessible={false}
          pointerEvents="none"
          style={[resolved.placeholder, { height: token.height + topInset }]}
        />
      ) : null}
    </>
  )
})

Navbar.displayName = 'Navbar'
