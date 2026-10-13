import { forwardRef } from 'react'
import { StyleSheet } from 'react-native'
import { Divider } from '../divider'
import { Pressable } from '../pressable'
import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
import { CellLayout } from './cell-layout'
import { useCellGroupContext } from './context'
import { normalizeCellLayout } from './normalize'
import { getCellStyles, isCellInteractive } from './style'
import { getCellToken } from './token'
import type { CellProps, CellStyleState } from './types'

export const Cell = forwardRef<React.ComponentRef<typeof Pressable>, CellProps>(
  function Cell(props, ref) {
    const {
      leading,
      title,
      titleExtra,
      description,
      value,
      valueExtra,
      trailing,
      vertical = false,
      center = false,
      valueAlign,
      showArrow = false,
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
      onLongPress,
      onPressDebounceWait,
      ...pressableProps
    } = props
    const isDisabled = disabled === true
    const token = useComponentToken('Cell', getCellToken)
    const group = useCellGroupContext()
    const hasInteraction = isCellInteractive({ clickable, onPress, onLongPress })
    const showDivider = border && (divider ?? (group != null && group.position !== 'last'))
    const cellProps: CellProps = {
      ...props,
      leading,
      title,
      titleExtra,
      description,
      value,
      valueExtra,
      trailing,
      vertical,
      center,
      valueAlign: valueAlign ?? (vertical ? 'left' : 'right'),
      showArrow,
      clickable,
      border,
      divider,
      required,
      arrowDirection,
      size,
      titleLines,
      valueLines,
      disabled: isDisabled,
    }
    const layout = normalizeCellLayout(cellProps)

    return (
      <Pressable
        ref={ref}
        {...pressableProps}
        disabled={isDisabled}
        pressStyle="none"
        accessibilityRole={
          pressableProps.accessibilityRole ??
          (hasInteraction || onPress || onLongPress ? 'button' : undefined)
        }
        onPress={onPress}
        onLongPress={onLongPress}
        onPressDebounceWait={onPressDebounceWait}
        style={({ pressed }) => {
          const state: CellStyleState = { pressed, disabled: isDisabled }
          const resolved = getCellStyles(token, cellProps, state, layout)
          const semantic = resolveStyles(styles, { props: cellProps, state })
          const pressedBackground =
            pressed && hasInteraction
              ? typeof styles === 'function'
                ? (StyleSheet.flatten(semantic?.root)?.backgroundColor ??
                  token.pressedBackgroundColor)
                : token.pressedBackgroundColor
              : undefined
          return [
            resolved.root,
            semantic?.root,
            style,
            pressedBackground !== undefined && { backgroundColor: pressedBackground },
          ]
        }}
      >
        {({ pressed }) => {
          const state: CellStyleState = { pressed, disabled: isDisabled }
          const resolved = getCellStyles(token, cellProps, state, layout)
          const semantic = resolveStyles(styles, { props: cellProps, state })
          return (
            <>
              <CellLayout
                props={cellProps}
                layout={layout}
                resolved={resolved}
                semantic={semantic}
                token={token}
              />
              {showDivider ? (
                <Divider
                  accessible={false}
                  color={token.borderColor}
                  role="none"
                  style={[resolved.divider, semantic?.divider]}
                  thickness={token.dividerWidth}
                />
              ) : null}
            </>
          )
        }}
      </Pressable>
    )
  },
)

Cell.displayName = 'Cell'
