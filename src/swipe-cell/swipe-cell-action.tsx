import { forwardRef } from 'react'
import { Pressable } from '../pressable'
import { Text } from '../text'
import { useComponentToken } from '../theme'
import { getSwipeCellActionBackgroundColor, getSwipeCellStyles } from './style'
import { getSwipeCellToken } from './token'
import type { SwipeCellActionProps } from './types'

export const SwipeCellAction = forwardRef<
  React.ComponentRef<typeof Pressable>,
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
    <Pressable
      ref={ref}
      {...pressableProps}
      pressStyle="opacity"
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
    </Pressable>
  )
})

SwipeCellAction.displayName = 'SwipeCellAction'
