import { Children, forwardRef, useCallback } from 'react'
import { View } from 'react-native'
import type {
  GestureResponderEvent,
  StyleProp,
  TextStyle,
  View as ViewComponent,
} from 'react-native'
import type { ReactNode } from 'react'
import { Icon } from '../icon'
import { InteractionPressable } from '../interaction'
import { resolveStyles } from '../style'
import { Text } from '../text'
import { useComponentToken, useToken } from '../theme'
import { getTagStyles, getTagToken } from './style'
import type { TagProps, TagStyleState } from './types'

function renderChild(child: ReactNode, labelStyle: StyleProp<TextStyle>) {
  if (typeof child === 'string' || typeof child === 'number') {
    return <Text style={labelStyle}>{child}</Text>
  }

  return child
}

export const Tag = forwardRef<ViewComponent, TagProps>(function Tag(
  {
    children,
    type = 'default',
    size = 'medium',
    color,
    textColor,
    plain = false,
    round = false,
    mark = false,
    closeable = false,
    disabled = false,
    onClose,
    style,
    styles,
    accessibilityState,
    ...viewProps
  },
  ref,
) {
  const { token } = useToken()
  const tagToken = useComponentToken('Tag', getTagToken)
  const tagProps: TagProps = {
    ...viewProps,
    children,
    type,
    size,
    color,
    textColor,
    plain,
    round,
    mark,
    closeable,
    disabled,
    onClose,
    style,
    styles,
  }
  const state: TagStyleState = { type, size, plain, round, mark, closeable, disabled }
  const semantic = resolveStyles(styles, { props: tagProps, state })
  const resolved = getTagStyles(token, tagToken, tagProps, state)

  const handleClose = useCallback(
    (event: GestureResponderEvent) => {
      event.stopPropagation()
      if (!disabled) onClose?.()
    },
    [disabled, onClose],
  )

  return (
    <View
      ref={ref}
      {...viewProps}
      accessibilityState={disabled ? { ...accessibilityState, disabled: true } : accessibilityState}
      style={[resolved.root, semantic?.root, style]}
    >
      <View style={[resolved.content, semantic?.content]}>
        {Children.map(children, (child) => renderChild(child, semantic?.label ?? resolved.label))}
        {closeable ? (
          <InteractionPressable
            accessibilityLabel="关闭标签"
            accessibilityRole="button"
            accessibilityState={{ disabled }}
            disabled={disabled}
            hitSlop={resolved.hitSlop}
            onPress={handleClose}
            style={[resolved.close, semantic?.close]}
          >
            <Icon
              name="CloseOutlined"
              color={resolved.iconColor}
              size={resolved.iconSize}
              style={[resolved.icon, semantic?.icon]}
            />
          </InteractionPressable>
        ) : null}
      </View>
    </View>
  )
})

Tag.displayName = 'Tag'
