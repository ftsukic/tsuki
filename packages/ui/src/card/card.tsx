import { Divider } from '../divider'
import { useToken } from '../theme'
import type { CardProps } from './interface'
import { createCardStyles } from './style'
import { useMemo } from 'react'
import type { ViewStyle } from 'react-native'
import { Pressable, Text, View } from 'react-native'

function renderText(value: CardProps['title'] | CardProps['footer'], style: object) {
  if (value === null || value === undefined || value === false) return null
  if (typeof value === 'string' || typeof value === 'number')
    return <Text style={style}>{value}</Text>
  return value
}

export function Card({
  children,
  title,
  titleLeftExtra,
  extra,
  footer,
  headerStyle,
  titleStyle,
  titleTextStyle,
  bodyStyle,
  footerStyle,
  footerTextStyle,
  size = 'm',
  square = false,
  headerDivider = true,
  footerDivider = true,
  bodyPadding = true,
  onPressHeader,
  onLayoutHeader,
  onLayoutBody,
  style,
  theme,
  ...restProps
}: CardProps) {
  const { components, token: themeToken } = useToken()
  const token = { ...components.Card, ...theme }
  const styles = useMemo(() => createCardStyles(token, themeToken), [themeToken, token])
  const header = title !== undefined || titleLeftExtra !== undefined || extra !== undefined
  const headerContent = (
    <>
      <View
        onLayout={onLayoutHeader}
        style={[styles.header, size === 's' ? styles.headerSmall : null, headerStyle]}
      >
        <View style={[styles.title, titleStyle]}>
          {titleLeftExtra}
          {renderText(title, [styles.titleText, titleTextStyle])}
        </View>
        {extra}
      </View>
      {headerDivider ? <Divider theme={{ margin: 0 }} /> : null}
    </>
  )
  const bodyPaddingStyle: ViewStyle | null =
    bodyPadding === true
      ? styles.body
      : bodyPadding === false
        ? null
        : typeof bodyPadding === 'number'
          ? { padding: bodyPadding }
          : {
              paddingLeft:
                typeof bodyPadding.left === 'number'
                  ? bodyPadding.left
                  : bodyPadding.left
                    ? token.padding
                    : 0,
              paddingRight:
                typeof bodyPadding.right === 'number'
                  ? bodyPadding.right
                  : bodyPadding.right
                    ? token.padding
                    : 0,
              paddingTop:
                typeof bodyPadding.top === 'number'
                  ? bodyPadding.top
                  : bodyPadding.top
                    ? token.padding
                    : 0,
              paddingBottom:
                typeof bodyPadding.bottom === 'number'
                  ? bodyPadding.bottom
                  : bodyPadding.bottom
                    ? token.padding
                    : 0,
            }
  const footerContent = renderText(footer, [styles.footerText, footerTextStyle])

  return (
    <View
      {...restProps}
      style={[styles.card, square ? null : size === 's' ? styles.cardSmall : null, style]}
    >
      {header ? (
        onPressHeader ? (
          <Pressable onPress={onPressHeader}>{headerContent}</Pressable>
        ) : (
          headerContent
        )
      ) : null}
      <View onLayout={onLayoutBody} style={[bodyPaddingStyle, bodyStyle]}>
        {children}
      </View>
      {footerContent !== null ? (
        <>
          {footerDivider ? <Divider theme={{ margin: 0 }} /> : null}
          <View style={[styles.footer, footerStyle]}>{footerContent}</View>
        </>
      ) : null}
    </View>
  )
}
