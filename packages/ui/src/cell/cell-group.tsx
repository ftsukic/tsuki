import { useToken } from '../theme'
import { Cell } from './cell'
import type { CellGroupProps, CellProps } from './interface'
import { createCellStyles } from './style'
import { SwipeCellView } from './swipe-cell'
import { Children, cloneElement, isValidElement } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'

const isCellElement = (child: ReactNode): child is ReactElement<CellProps> =>
  isValidElement(child) && (child.type === Cell || child.type === SwipeCellView)

function renderTitle(
  content: ReactNode,
  style: object,
  onPress?: CellGroupProps['onPressTitleText'],
  activeOpacity = 0.6,
) {
  if (content === null || content === undefined || content === false) return null
  if (typeof content === 'string' || typeof content === 'number') {
    const title = <Text style={style}>{content}</Text>
    return onPress ? (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => (pressed ? { opacity: activeOpacity } : undefined)}
      >
        {title}
      </Pressable>
    ) : (
      title
    )
  }
  return content
}

export function CellGroup({
  children,
  title,
  extra,
  style,
  titleTextStyle,
  bodyStyle,
  bodyTopDivider = false,
  bodyBottomDivider = false,
  onPressTitle,
  onPressTitleText,
  theme,
}: CellGroupProps) {
  const { components, token: themeToken } = useToken()
  const token = { ...components.Cell, ...theme }
  const styles = createCellStyles(token, themeToken)
  const titleContent = renderTitle(
    title,
    [styles.groupTitleText, titleTextStyle],
    onPressTitleText,
    token.activeOpacity,
  )
  const header =
    titleContent || extra ? (
      <View style={styles.groupTitle}>
        {titleContent}
        {extra}
      </View>
    ) : null
  const groupChildren = Children.toArray(children)
  const normalizedChildren = groupChildren.map((child, index) => {
    if (index !== groupChildren.length - 1 || !isCellElement(child)) return child

    return cloneElement(child, { divider: false })
  })
  const body = (
    <>
      {bodyTopDivider ? <View style={styles.divider} /> : null}
      {normalizedChildren}
      {bodyBottomDivider ? <View style={styles.divider} /> : null}
    </>
  )

  return (
    <View style={style}>
      {onPressTitle && header ? <Pressable onPress={onPressTitle}>{header}</Pressable> : header}
      {bodyStyle ? <View style={bodyStyle}>{body}</View> : body}
    </View>
  )
}
