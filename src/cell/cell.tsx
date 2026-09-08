import { Icon } from '../icon'
import { Divider } from '../divider'
import { InteractionPressable } from '../interaction'
import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
import { getCellStyles, isCellInteractive } from './style'
import { getCellToken } from './token'
import { useCellGroupContext } from './context'
import type { CellProps, CellStyleState } from './interface'
import { forwardRef, type ReactNode } from 'react'
import { Text, View } from 'react-native'
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

export const Cell = forwardRef<React.ElementRef<typeof InteractionPressable>, CellProps>(
  function Cell(
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
    const groupContext = useCellGroupContext()
    const isDisabled = disabled === true
    const hasInteraction = isCellInteractive({ clickable, onPress, isLink })
    const showDivider = border && groupContext?.position !== 'last'
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

    return (
      <InteractionPressable
        ref={ref}
        {...pressableProps}
        disabled={isDisabled}
        accessibilityRole={
          hasInteraction || Boolean(onPress) ? 'button' : pressableProps.accessibilityRole
        }
        onPress={onPress}
        onPressDebounceWait={onPressDebounceWait}
        style={({ pressed }) => {
          const state: CellStyleState = { pressed, disabled: isDisabled }
          const resolved = getCellStyles(cellToken, cellProps, state)
          const semantic = resolveStyles(styles, { props: cellProps, state })
          return [resolved.root, semantic?.root, style]
        }}
      >
        {({ pressed }) => {
          const state: CellStyleState = { pressed, disabled: isDisabled }
          const resolved = getCellStyles(cellToken, cellProps, state)
          const semantic = resolveStyles(styles, { props: cellProps, state })
          const hasTitle = isVisible(title)
          const hasLabel = isVisible(label)
          const hasValue = isVisible(value)
          const hasExtra = isVisible(extra)

          return (
            <>
              <View style={resolved.row}>
                {icon ? <View style={[resolved.icon, semantic?.icon]}>{icon}</View> : null}
                {required ? <Text style={resolved.required}>*</Text> : null}
                {hasTitle || hasLabel ? (
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
                ) : null}
                {hasValue ? (
                  <View style={resolved.valueContainer}>
                    {renderText(
                      value,
                      semantic?.value ? [resolved.value, semantic.value] : resolved.value,
                    )}
                  </View>
                ) : null}
                {hasExtra ? (
                  <View style={resolved.extraContainer}>
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
              {showDivider ? (
                <Divider
                  color={cellToken.borderColor}
                  style={resolved.divider}
                  thickness={cellToken.dividerWidth}
                />
              ) : null}
            </>
          )
        }}
      </InteractionPressable>
    )
  },
)

Cell.displayName = 'Cell'
