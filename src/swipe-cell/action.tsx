import { forwardRef } from 'react'
import { Text } from 'react-native'
import { InteractionPressable } from '../interaction'
import { useComponentToken } from '../theme'
import { getSwipeCellStyles } from './style'
import { getSwipeCellToken } from './token'
import type { SwipeCellActionProps } from './interface'

export const SwipeCellAction = forwardRef<
  React.ElementRef<typeof InteractionPressable>,
  SwipeCellActionProps
>(function SwipeCellAction(
  { children, backgroundColor, textColor, width, style, ...pressableProps },
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
        backgroundColor ? { backgroundColor } : null,
        width !== undefined ? { width } : null,
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
    >
      {content}
    </InteractionPressable>
  )
})

SwipeCellAction.displayName = 'SwipeCellAction'
