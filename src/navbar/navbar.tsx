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
import type { TextStyle } from 'react-native'

const NAVBAR_SLOT_ACTION_STYLE = {
  alignItems: 'center' as const,
  flexDirection: 'row' as const,
  justifyContent: 'center' as const,
}

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

function renderNavbarSlotAction(
  content: ReactNode,
  onPress: NavbarProps['onPressLeft'],
  testID?: string,
) {
  return onPress === undefined ? (
    content
  ) : (
    <Pressable
      testID={testID}
      onPress={onPress}
      pressStyle="opacity"
      style={NAVBAR_SLOT_ACTION_STYLE}
    >
      {content}
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

  const renderDefaultRight = () =>
    isTextContent(rightText) ? (
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
    ) : (
      rightText
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
    left !== undefined
      ? renderNavbarSlotAction(left, onPressLeft, leftActionTestID)
      : leftArrow || leftText !== undefined
        ? renderNavbarSlotAction(renderDefaultLeft(), onPressLeft, leftActionTestID)
        : null
  const rightContent =
    right !== undefined
      ? renderNavbarSlotAction(right, onPressRight, rightActionTestID)
      : rightText !== undefined
        ? renderNavbarSlotAction(renderDefaultRight(), onPressRight, rightActionTestID)
        : null

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
            <View
              testID={testID === undefined ? undefined : `${testID}-title-wrapper`}
              style={resolved.titleWrapper}
            >
              {renderTitle()}
            </View>
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
