import { Icon } from '../icon'
import { useToken } from '../theme'
import type { CellProps } from './interface'
import { createCellStyles } from './style'
import { emitSwipeCellClickAway } from './swipe-cell-events'
import { useCallback, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import type { StyleProp, TextStyle } from 'react-native'

function renderCellContent(
  content: ReactNode,
  style: StyleProp<TextStyle>,
  numberOfLines?: number,
) {
  if (content === null || content === undefined || content === false) return null
  if (typeof content === 'string' || typeof content === 'number') {
    return (
      <Text numberOfLines={numberOfLines} style={style}>
        {content}
      </Text>
    )
  }
  return content
}

const ARROW_ICONS = {
  right: 'RightOutlined',
  down: 'DownOutlined',
  left: 'LeftOutlined',
  up: 'UpOutlined',
} as const

export function Cell({
  title,
  value,
  titleExtra,
  valueExtra,
  extra,
  innerStyle,
  titleStyle,
  titleTextStyle,
  valueStyle,
  valueTextStyle,
  extraTextStyle,
  contentStyle,
  divider = true,
  dividerLeftGap,
  dividerRightGap,
  isLink = false,
  onPressLink,
  underlayColor,
  center = false,
  arrowDirection = 'right',
  required = false,
  vertical = false,
  valueTextNumberOfLines,
  titleTextNumberOfLines,
  textAlign = 'right',
  onPressDebounceWait = 0,
  style,
  theme,
  onPress,
  ...restProps
}: CellProps) {
  const { components, token: themeToken } = useToken()
  const token = { ...components.Cell, ...theme }
  const styles = useMemo(() => createCellStyles(token, themeToken), [themeToken, token])
  const lastPressAt = useRef(0)
  const resolvedTextAlign = vertical ? 'left' : textAlign
  const hasInteraction = Boolean(
    onPress || restProps.onLongPress || restProps.onPressIn || restProps.onPressOut,
  )

  const handlePress = useCallback(
    (event: Parameters<NonNullable<CellProps['onPress']>>[0]) => {
      if (!onPress) return
      const now = Date.now()
      if (onPressDebounceWait > 0 && now - lastPressAt.current < onPressDebounceWait) return
      lastPressAt.current = now
      onPress(event)
    },
    [onPress, onPressDebounceWait],
  )

  const handlePressIn = useCallback(
    (event: Parameters<NonNullable<CellProps['onPressIn']>>[0]) => {
      emitSwipeCellClickAway()
      restProps.onPressIn?.(event)
    },
    [restProps.onPressIn],
  )

  const titleContent = renderCellContent(
    title,
    [styles.titleText, titleTextStyle],
    titleTextNumberOfLines,
  )
  const valueContent = renderCellContent(
    value,
    [styles.valueText, { textAlign: resolvedTextAlign }, valueTextStyle],
    valueTextNumberOfLines,
  )
  const extraContent = renderCellContent(extra, [styles.extraText, extraTextStyle])
  const titleExtraContent =
    titleExtra === null || titleExtra === undefined || titleExtra === false ? null : (
      <View style={styles.titleExtra}>{titleExtra}</View>
    )
  const arrowIcon = (
    <Icon
      name={ARROW_ICONS[arrowDirection]}
      size={token.iconSize}
      color={token.iconColor}
      style={styles.arrow}
    />
  )
  const arrow = isLink ? (
    onPressLink ? (
      <Pressable onPress={onPressLink} hitSlop={themeToken.sizeSM} accessibilityRole="button">
        {arrowIcon}
      </Pressable>
    ) : (
      arrowIcon
    )
  ) : null
  const content = (
    <>
      <View
        style={[
          styles.value,
          valueContent ? { minWidth: token.valueMinWidth } : null,
          center && { alignSelf: 'center' },
          valueStyle,
        ]}
      >
        {valueContent}
      </View>
      {valueExtra}
      {arrow}
    </>
  )

  return (
    <Pressable
      {...restProps}
      accessibilityRole={onPress || isLink ? 'button' : undefined}
      onPressIn={handlePressIn}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.cell,
        style,
        pressed && hasInteraction ? { backgroundColor: underlayColor ?? token.activeColor } : null,
      ]}
    >
      <View style={[styles.inner, vertical ? null : styles.innerRow, innerStyle]}>
        <View style={[styles.title, center && { alignSelf: 'center' }, titleStyle]}>
          {required ? (
            <View style={styles.required}>
              <Text style={styles.requiredText}>*</Text>
            </View>
          ) : null}
          {titleExtraContent}
          {titleContent}
        </View>
        {vertical ? <View style={[styles.content, contentStyle]}>{content}</View> : content}
      </View>
      {extraContent}
      {divider ? (
        <View
          style={[
            styles.divider,
            {
              marginLeft: dividerLeftGap ?? token.paddingHorizontal,
              marginRight: dividerRightGap ?? token.paddingHorizontal,
            },
          ]}
        />
      ) : null}
    </Pressable>
  )
}
