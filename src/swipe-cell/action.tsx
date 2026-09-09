import { forwardRef } from 'react'
import { Text } from 'react-native'
import { InteractionPressable } from '../interaction'
import { useComponentToken } from '../theme'
import { getSwipeCellActionBackgroundColor, getSwipeCellStyles } from './style'
import { getSwipeCellToken } from './token'
import type { SwipeCellActionProps } from './interface'

export const SwipeCellAction = forwardRef<
  React.ComponentRef<typeof InteractionPressable>,
  SwipeCellActionProps
>(function SwipeCellAction(
  { children, color, backgroundColor, textColor, width, style, ...pressableProps },
  ref,
) {
  const token = useComponentToken('SwipeCell', getSwipeCellToken)
  const styles = getSwipeCellStyles(token)
  const content =
    typeof children === 'string' || typeof children === 'number' ? (
      <Text style={[styles.actionLabel, textColor ? { color: textColor } : null]}>{children}</Text>
    ) : (
      children
    )

  return (
    <InteractionPressable
      ref={ref}
      {...pressableProps}
      style={({ pressed }) => [
        styles.action,
        {
          backgroundColor: backgroundColor ?? getSwipeCellActionBackgroundColor(token, color),
        },
        width !== undefined ? { width } : null,
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
    >
      {content}
    </InteractionPressable>
  )
})

SwipeCellAction.displayName = 'SwipeCellAction'
