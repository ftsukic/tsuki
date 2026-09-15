import { forwardRef } from 'react'
import { View } from 'react-native'
import { Divider } from '../divider'
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
    leftArrow = true,
    leftIconSize,
    leftText,
    rightText,
    onPressLeft,
    onPressRight,
    border = true,
    style,
    styles,
    testID,
    ...viewProps
  },
  ref,
) {
  const token = useComponentToken('Navbar', getNavbarToken)
  const { token: aliasToken } = useToken()
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
    style,
    styles,
  }
  const idleState: NavbarStyleState = { pressed: false }
  const resolved = getNavbarStyles(token, aliasToken)
  const semantic = resolveStyles(styles, { props, state: idleState })
  const hasCenter = title !== undefined && title !== null
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
      left
    ) : (
      <NavbarAction testID={leftActionTestID} onPress={onPressLeft}>
        {renderDefaultLeft()}
      </NavbarAction>
    )
  const rightContent =
    right !== undefined ? (
      right
    ) : rightText !== undefined ? (
      <NavbarAction testID={rightActionTestID} onPress={onPressRight}>
        {rightText}
      </NavbarAction>
    ) : null

  return (
    <View ref={ref} {...viewProps} testID={testID} style={[resolved.root, semantic?.root, style]}>
      <View
        testID={testID === undefined ? undefined : `${testID}-bar`}
        style={[resolved.bar, hasCenter ? resolved.barCentered : resolved.barSplit, semantic?.bar]}
      >
        <View
          testID={leftTestID}
          style={[
            resolved.left,
            hasCenter ? resolved.leftCentered : resolved.leftSplit,
            semantic?.left,
          ]}
        >
          {leftContent}
        </View>
        {hasCenter ? (
          <View
            testID={testID === undefined ? undefined : `${testID}-title`}
            pointerEvents="none"
            style={resolved.center}
          >
            {renderTitle()}
          </View>
        ) : null}
        <View
          testID={rightTestID}
          style={[
            resolved.right,
            hasCenter ? resolved.rightCentered : resolved.rightSplit,
            semantic?.right,
          ]}
        >
          {rightContent}
        </View>
      </View>
      {border ? (
        <Divider
          testID={testID === undefined ? undefined : `${testID}-divider`}
          color={token.borderColor}
          thickness={aliasToken.lineWidthHairline}
          style={[resolved.divider, semantic?.divider]}
        />
      ) : null}
    </View>
  )
})

Navbar.displayName = 'Navbar'
