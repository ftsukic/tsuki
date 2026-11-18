import { forwardRef, useContext } from 'react'
import { View } from 'react-native'
import { SwipeCellActionWidthContext } from './context'
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
  const contentLayout = useContext(SwipeCellActionWidthContext)
  const measuredWidth = contentLayout?.width ?? null
  const token = useComponentToken('SwipeCell', getSwipeCellToken)
  const styles = getSwipeCellStyles(token)
  const content =
    typeof children === 'string' || typeof children === 'number' ? (
      <Text
        numberOfLines={measuredWidth !== null ? 1 : undefined}
        ellipsizeMode="clip"
        style={[
          styles.actionLabel,
          measuredWidth !== null ? { width: '100%' } : null,
          textColor ? { color: textColor } : null,
        ]}
      >
        {children}
      </Text>
    ) : (
      children
    )

  return (
    <Pressable
      ref={ref}
      {...pressableProps}
      disabled={pressableProps.disabled ?? false}
      pressStyle="overlay"
      pressedOverlayColor={token.actionPressedOverlayColor}
      style={(state) => [
        styles.action,
        {
          backgroundColor: backgroundColor ?? getSwipeCellActionBackgroundColor(token, color),
        },
        width !== undefined ? { width } : null,
        measuredWidth !== null
          ? {
              width: '100%',
              minWidth: 0,
              paddingHorizontal: 0,
              flex: 1,
              overflow: 'hidden',
              alignItems: contentLayout?.side === 'left' ? 'flex-end' : 'flex-start',
            }
          : null,
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      {measuredWidth !== null ? (
        <View
          style={{ width: '100%', minWidth: measuredWidth, alignItems: 'center', flexShrink: 0 }}
        >
          {content}
        </View>
      ) : (
        content
      )}
    </Pressable>
  )
})

SwipeCellAction.displayName = 'SwipeCellAction'
