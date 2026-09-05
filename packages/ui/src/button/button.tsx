import { LoadingIcon } from '../loading'
import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
import { getButtonStyles } from './style'
import { getButtonToken } from './token'
import type { ButtonProps, ButtonStyleState } from './interface'
import { forwardRef, useCallback, useRef } from 'react'
import { Pressable, Text, View } from 'react-native'
import type { ReactNode } from 'react'

function isTextContent(value: ReactNode): value is string | number {
  return typeof value === 'string' || typeof value === 'number'
}

export const Button = forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(function Button(
  {
    children,
    type = 'default',
    size = 'normal',
    color,
    plain = false,
    block = false,
    round = false,
    square = false,
    hairline = false,
    disabled = false,
    loading = false,
    loadingText,
    icon,
    iconPosition = 'left',
    style,
    styles,
    onPress,
    onPressDebounceWait,
    ...pressableProps
  },
  ref,
) {
  const buttonToken = useComponentToken('Button', getButtonToken)
  const lastPressTime = useRef(0)
  const isDisabled = disabled || loading
  const buttonProps: ButtonProps = {
    children,
    type,
    size,
    color,
    plain,
    block,
    round,
    square,
    hairline,
    disabled,
    loading,
    loadingText,
    icon,
    iconPosition,
    style,
    styles,
    onPress,
    onPressDebounceWait,
  }

  const handlePress = useCallback<NonNullable<ButtonProps['onPress']>>(
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
      accessibilityRole={pressableProps.accessibilityRole ?? 'button'}
      disabled={isDisabled}
      onPress={handlePress}
      style={({ pressed }) => {
        const state: ButtonStyleState = { pressed, disabled: isDisabled, loading }
        const resolved = getButtonStyles(buttonToken, buttonProps, state)
        const semantic = resolveStyles(styles, { props: buttonProps, state })
        return [resolved.root, semantic?.root, style]
      }}
    >
      {({ pressed }) => {
        const state: ButtonStyleState = { pressed, disabled: isDisabled, loading }
        const resolved = getButtonStyles(buttonToken, buttonProps, state)
        const semantic = resolveStyles(styles, { props: buttonProps, state })
        const content = loading ? loadingText : children

        return (
          <View style={resolved.contentContainer}>
            {icon && iconPosition === 'left' ? (
              <View style={[resolved.icon, semantic?.icon]}>{icon}</View>
            ) : null}
            {loading ? (
              <View style={[resolved.icon, semantic?.icon]}>
                <LoadingIcon
                  size={resolved.label.fontSize ?? buttonToken.contentFontSize}
                  color={resolved.iconColor}
                  duration={900}
                  active
                  style={{ marginRight: content ? buttonToken.iconGap : 0 }}
                />
              </View>
            ) : null}
            {content !== undefined ? (
              isTextContent(content) ? (
                <Text style={[resolved.label, semantic?.content]}>{content}</Text>
              ) : (
                <View style={semantic?.content}>{content}</View>
              )
            ) : null}
            {icon && iconPosition === 'right' ? (
              <View style={[resolved.icon, semantic?.icon]}>{icon}</View>
            ) : null}
          </View>
        )
      }}
    </Pressable>
  )
})

Button.displayName = 'Button'
