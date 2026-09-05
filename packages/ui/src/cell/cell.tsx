import { Icon } from '../icon'
import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
import { getCellStyles } from './style'
import { getCellToken } from './token'
import type { CellProps, CellStyleState } from './interface'
import { forwardRef, useCallback, useRef, type ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import type { StyleProp, TextStyle } from 'react-native'
import type { IconName } from '../icon'

const ARROW_ICONS: Record<NonNullable<CellProps['arrowDirection']>, IconName> = {
  right: 'RightOutlined',
  left: 'LeftOutlined',
  up: 'UpOutlined',
  down: 'DownOutlined',
}

function isVisible(value: ReactNode): boolean {
  return value !== null && value !== undefined && value !== false
}

function renderText(value: ReactNode, style: StyleProp<TextStyle>) {
  if (!isVisible(value)) return null
  if (typeof value === 'string' || typeof value === 'number')
    return <Text style={style}>{value}</Text>
  return value
}

export const Cell = forwardRef<React.ElementRef<typeof Pressable>, CellProps>(function Cell(
  {
    icon,
    title,
    label,
    value,
    extra,
    center = false,
    isLink = false,
    clickable,
    border = true,
    required = false,
    arrowDirection = 'right',
    size = 'normal',
    style,
    styles,
    disabled = false,
    onPress,
    onPressDebounceWait,
    ...pressableProps
  },
  ref,
) {
  const cellToken = useComponentToken('Cell', getCellToken)
  const isDisabled = disabled === true
  const hasInteraction = clickable ?? Boolean(onPress || isLink)
  const lastPressTime = useRef(0)
  const cellProps: CellProps = {
    icon,
    title,
    label,
    value,
    extra,
    center,
    isLink,
    clickable,
    border,
    required,
    arrowDirection,
    size,
    style,
    styles,
    disabled: isDisabled,
    onPress,
    onPressDebounceWait,
  }

  const handlePress = useCallback<NonNullable<CellProps['onPress']>>(
    (event) => {
      if (!onPress || isDisabled) return
      const now = Date.now()
      if (onPressDebounceWait !== undefined && now - lastPressTime.current < onPressDebounceWait)
        return
      lastPressTime.current = now
      onPress(event)
    },
    [isDisabled, onPress, onPressDebounceWait],
  )

  return (
    <Pressable
      ref={ref}
      {...pressableProps}
      disabled={isDisabled}
      accessibilityRole={onPress || isLink ? 'button' : pressableProps.accessibilityRole}
      onPress={handlePress}
      style={({ pressed }) => {
        const state: CellStyleState = { pressed, disabled: isDisabled }
        const resolved = getCellStyles(cellToken, cellProps, state)
        const semantic = resolveStyles(styles, { props: cellProps, state })
        return [
          resolved.root,
          hasInteraction && pressed && { backgroundColor: cellToken.activeColor },
          semantic?.root,
          style,
        ]
      }}
    >
      {({ pressed }) => {
        const state: CellStyleState = { pressed, disabled: isDisabled }
        const resolved = getCellStyles(cellToken, cellProps, state)
        const semantic = resolveStyles(styles, { props: cellProps, state })
        const hasTitle = isVisible(title)
        const hasLabel = isVisible(label)

        return (
          <>
            <View style={resolved.row}>
              {icon ? <View style={[resolved.icon, semantic?.icon]}>{icon}</View> : null}
              {required ? <Text style={resolved.required}>*</Text> : null}
              <View style={resolved.content}>
                {hasTitle
                  ? renderText(
                      title,
                      semantic?.title ? [resolved.title, semantic.title] : resolved.title,
                    )
                  : null}
                {hasLabel
                  ? renderText(
                      label,
                      semantic?.label ? [resolved.label, semantic.label] : resolved.label,
                    )
                  : null}
              </View>
              {isVisible(value) ? (
                <View
                  style={{
                    justifyContent: center ? 'center' : 'flex-start',
                    minWidth: cellToken.valueMinWidth,
                  }}
                >
                  {renderText(
                    value,
                    semantic?.value ? [resolved.value, semantic.value] : resolved.value,
                  )}
                </View>
              ) : null}
              {isVisible(extra) ? (
                <View style={{ justifyContent: center ? 'center' : 'flex-start' }}>
                  {renderText(
                    extra,
                    semantic?.extra ? [resolved.extra, semantic.extra] : resolved.extra,
                  )}
                </View>
              ) : null}
              {isLink ? (
                <View style={[resolved.suffix, semantic?.suffix]}>
                  <Icon
                    name={ARROW_ICONS[arrowDirection]}
                    size={cellToken.iconSize}
                    color={cellToken.iconColor}
                  />
                </View>
              ) : null}
            </View>
            {border ? <View style={resolved.divider} /> : null}
          </>
        )
      }}
    </Pressable>
  )
})

Cell.displayName = 'Cell'
