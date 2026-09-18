import { forwardRef, useContext } from 'react'
import { View } from 'react-native'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import { Icon } from '../icon'
import { resolveStyles } from '../style'
import { Text } from '../text'
import { useComponentToken, useToken } from '../theme'
import { NavbarAction } from './navbar-action'
import { getNavbarStyles } from './style'
import { getNavbarToken } from './token'
import type { NavbarProps, NavbarStyleState } from './types'
import type { ReactNode } from 'react'
import type { TextStyle } from 'react-native'

function isTextContent(value: ReactNode): value is string | number {
  return typeof value === 'string' || typeof value === 'number'
}

function NavbarBackContent({
  arrow,
  text,
  textStyle,
  iconSize,
  iconColor,
  gap,
}: {
  arrow: boolean
  text: ReactNode
  textStyle: TextStyle
  iconSize: number
  iconColor: string
  gap: number
}) {
  return (
    <View style={{ alignItems: 'center', flexDirection: 'row', flexShrink: 0, maxWidth: '100%' }}>
      {arrow ? <Icon name="LeftOutlined" size={iconSize} color={iconColor} /> : null}
      {isTextContent(text) ? (
        <Text
          ellipsizeMode="tail"
          numberOfLines={1}
          style={[textStyle, { flexShrink: 1, marginLeft: arrow ? gap : 0 }]}
        >
          {text}
        </Text>
      ) : (
        text
      )}
    </View>
  )
}

export const Navbar = forwardRef<View, NavbarProps>(function Navbar(
  {
    title,
    left,
    right,
    leftArrow = false,
    leftIconSize,
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
  const idleState: NavbarStyleState = { pressed: false }
  const resolved = getNavbarStyles(token, aliasToken)
  const semantic = resolveStyles(styles, { props, state: idleState })
  const leftTestID = testID === undefined ? undefined : `${testID}-left`
  const leftActionTestID = testID === undefined ? undefined : `${testID}-left-action`
  const rightTestID = testID === undefined ? undefined : `${testID}-right`
  const rightActionTestID = testID === undefined ? undefined : `${testID}-right-action`
  const leftTextStyle = {
    color: token.actionColor,
    fontFamily: aliasToken.fontFamily,
    fontSize: token.actionFontSize,
    lineHeight: aliasToken.lineHeight,
  }

  const renderDefaultLeft = () => (
    <NavbarBackContent
      arrow={leftArrow}
      iconColor={token.actionColor}
      iconSize={leftIconSize ?? token.iconSize}
      gap={aliasToken.paddingXXS}
      text={leftText}
      textStyle={leftTextStyle}
    />
  )

  const renderTitle = () =>
    isTextContent(title) ? (
      <Text ellipsizeMode="tail" style={[resolved.title, semantic?.title]} numberOfLines={1}>
        {title}
      </Text>
    ) : (
      title
    )

  const leftContent =
    left !== undefined ? (
      onPressLeft === undefined ? (
        left
      ) : (
        <NavbarAction testID={leftActionTestID} onPress={onPressLeft}>
          {left}
        </NavbarAction>
      )
    ) : leftArrow || leftText !== undefined ? (
      <NavbarAction testID={leftActionTestID} onPress={onPressLeft}>
        {renderDefaultLeft()}
      </NavbarAction>
    ) : null
  const rightContent =
    right !== undefined ? (
      onPressRight === undefined ? (
        right
      ) : (
        <NavbarAction testID={rightActionTestID} onPress={onPressRight}>
          {right}
        </NavbarAction>
      )
    ) : rightText !== undefined ? (
      <NavbarAction testID={rightActionTestID} onPress={onPressRight}>
        {rightText}
      </NavbarAction>
    ) : null

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
          <View testID={leftTestID} style={[resolved.left, semantic?.left]}>
            {leftContent}
          </View>
          <View
            testID={testID === undefined ? undefined : `${testID}-title`}
            pointerEvents="none"
            style={resolved.center}
          >
            {renderTitle()}
          </View>
          <View testID={rightTestID} style={[resolved.right, semantic?.right]}>
            {rightContent}
          </View>
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
