import { forwardRef, type ReactNode } from 'react'
import { View } from 'react-native'
import type { StyleProp, TextStyle } from 'react-native'
import { Divider } from '../divider'
import { Icon } from '../icon'
import type { IconName } from '../icon'
import { Pressable } from '../pressable'
import { resolveStyles } from '../style'
import { Text } from '../text'
import { useComponentToken } from '../theme'
import { useCellGroupContext } from './context'
import { getCellStyles, isCellInteractive } from './style'
import { getCellToken } from './token'
import type { CellProps, CellStyleState } from './types'

const ARROW_ICONS: Record<NonNullable<CellProps['arrowDirection']>, IconName> = {
  right: 'RightOutlined',
  left: 'LeftOutlined',
  up: 'UpOutlined',
  down: 'DownOutlined',
}

function isVisible(value: ReactNode): boolean {
  return value !== null && value !== undefined && value !== false
}

function renderText(value: ReactNode, style: StyleProp<TextStyle>, numberOfLines?: number) {
  if (!isVisible(value)) return null
  if (typeof value === 'string' || typeof value === 'number') {
    return (
      <Text numberOfLines={numberOfLines} style={style}>
        {value}
      </Text>
    )
  }
  return value
}

export const Cell = forwardRef<React.ComponentRef<typeof Pressable>, CellProps>(function Cell(
  {
    icon,
    title,
    titleExtra,
    label,
    value,
    valueExtra,
    extra,
    vertical = false,
    center = false,
    valueAlign = vertical ? 'left' : 'right',
    isLink = false,
    clickable,
    border = true,
    divider,
    required = false,
    arrowDirection = 'right',
    size = 'normal',
    titleLines,
    valueLines,
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
  const autoDivider = groupContext != null && groupContext.position !== 'last'
  const showDivider = border && (divider ?? autoDivider)
  const cellProps: CellProps = {
    icon,
    title,
    titleExtra,
    label,
    value,
    valueExtra,
    extra,
    vertical,
    center,
    valueAlign,
    isLink,
    clickable,
    border,
    divider,
    required,
    arrowDirection,
    size,
    titleLines,
    valueLines,
    style,
    styles,
    disabled: isDisabled,
    onPress,
    onPressDebounceWait,
  }

  return (
    <Pressable
      ref={ref}
      {...pressableProps}
      disabled={isDisabled}
      pressStyle="none"
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
        const hasTitleExtra = isVisible(titleExtra)
        const hasLabel = isVisible(label)
        const hasValue = isVisible(value)
        const hasValueExtra = isVisible(valueExtra)
        const hasExtra = isVisible(extra)
        const hasTitleArea = hasTitle || hasTitleExtra || hasLabel || required
        const hasValueArea = hasValue || hasValueExtra

        return (
          <>
            <View style={[resolved.row, semantic?.row]}>
              {icon ? <View style={[resolved.icon, semantic?.icon]}>{icon}</View> : null}
              <View style={[resolved.main, semantic?.main]}>
                {hasTitleArea ? (
                  <View style={[resolved.titleArea, semantic?.titleArea]}>
                    <View style={[resolved.titleRow, semantic?.titleRow]}>
                      {required ? (
                        <Text style={[resolved.required, semantic?.required]}>*</Text>
                      ) : null}
                      {hasTitle
                        ? renderText(title, [resolved.title, semantic?.title], titleLines)
                        : null}
                      {hasTitleExtra ? (
                        <View style={resolved.titleExtraContainer}>
                          {renderText(
                            titleExtra,
                            semantic?.titleExtra
                              ? [resolved.titleExtra, semantic.titleExtra]
                              : resolved.titleExtra,
                          )}
                        </View>
                      ) : null}
                    </View>
                    {hasLabel
                      ? renderText(
                          label,
                          semantic?.label ? [resolved.label, semantic.label] : resolved.label,
                        )
                      : null}
                  </View>
                ) : null}
                {hasValueArea ? (
                  <View style={[resolved.valueArea, semantic?.valueArea]}>
                    {hasValue
                      ? renderText(value, [resolved.value, semantic?.value], valueLines)
                      : null}
                    {hasValueExtra ? (
                      <View style={resolved.valueExtraContainer}>
                        {renderText(
                          valueExtra,
                          semantic?.valueExtra
                            ? [resolved.valueExtra, semantic.valueExtra]
                            : resolved.valueExtra,
                        )}
                      </View>
                    ) : null}
                  </View>
                ) : null}
              </View>
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
                style={[resolved.divider, semantic?.divider]}
                thickness={cellToken.dividerWidth}
              />
            ) : null}
          </>
        )
      }}
    </Pressable>
  )
})

Cell.displayName = 'Cell'
