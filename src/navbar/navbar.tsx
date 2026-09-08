import { forwardRef } from 'react'
import { Text, View } from 'react-native'
import { Divider } from '../divider'
import { Icon } from '../icon'
import { resolveStyles } from '../style'
import { useComponentToken, useToken } from '../theme'
import { NavbarAction } from './navbar-action'
import { getNavbarStyles } from './style'
import { getNavbarToken } from './token'
import type { NavbarProps, NavbarStyleState } from './interface'
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
  const leftTestID = testID === undefined ? undefined : `${testID}-left`
  const rightTestID = testID === undefined ? undefined : `${testID}-right`
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
      iconSize={token.iconSize}
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

  const renderAction = (
    side: 'left' | 'right',
    actionTestID: string | undefined,
    content: ReactNode,
    onPress: NavbarProps['onPressLeft'],
  ) => (
    <NavbarAction
      testID={actionTestID}
      onPress={onPress}
      style={({ pressed }) => {
        const state: NavbarStyleState = { pressed }
        const currentSemantic = resolveStyles(styles, { props, state })
        return [resolved[side], currentSemantic?.[side]]
      }}
    >
      {content}
    </NavbarAction>
  )

  return (
    <View ref={ref} {...viewProps} testID={testID} style={[resolved.root, semantic?.root, style]}>
      <View
        testID={testID === undefined ? undefined : `${testID}-bar`}
        style={[resolved.bar, semantic?.bar]}
      >
        {renderAction('left', leftTestID, left ?? renderDefaultLeft(), onPressLeft)}
        <View
          testID={testID === undefined ? undefined : `${testID}-title`}
          pointerEvents="none"
          style={resolved.titleContainer}
        >
          {renderTitle()}
        </View>
        {renderAction('right', rightTestID, right ?? rightText, onPressRight)}
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
