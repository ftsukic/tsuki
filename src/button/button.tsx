import { Loading } from '../loading'
import { InteractionPressable } from '../interaction'
import { resolveStyles } from '../style'
import { useComponentToken, useToken } from '../theme'
import { ButtonGroupContext } from './context'
import { ButtonGroup, getButtonGroupConnectedStyle } from './group'
import { getButtonStyles } from './style'
import { getButtonToken } from './token'
import type { ButtonProps, ButtonStyleState } from './interface'
import { forwardRef, useContext } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { ReactNode } from 'react'

function isTextContent(value: ReactNode): value is string | number {
  return typeof value === 'string' || typeof value === 'number'
}

const InternalButton = forwardRef<React.ElementRef<typeof InteractionPressable>, ButtonProps>(
  function Button(
    {
      children,
      type = 'default',
      size,
      color,
      variant,
      shape,
      plain = false,
      block = false,
      round = false,
      square = false,
      circle = false,
      hairline = false,
      disabled = false,
      loading = false,
      loadingText,
      loadingType = 'circular',
      loadingSize,
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
    const { token: themeToken } = useToken()
    const buttonToken = useComponentToken('Button', getButtonToken)
    const groupContext = useContext(ButtonGroupContext)
    const mergedSize = size ?? groupContext.size ?? 'normal'
    const explicitShape =
      shape ?? (circle ? 'circle' : square ? 'square' : round ? 'round' : undefined)
    const mergedShape = explicitShape ?? groupContext.shape ?? 'default'
    const isDisabled = disabled || loading
    const resolvedVariant = variant ?? (plain ? 'outline' : undefined)
    const buttonProps: ButtonProps = {
      children,
      type,
      size: mergedSize,
      color,
      variant: resolvedVariant,
      shape: mergedShape,
      plain,
      block,
      round,
      square,
      circle,
      hairline,
      disabled,
      loading,
      loadingText,
      loadingType,
      loadingSize,
      icon,
      iconPosition,
      style,
      styles,
      onPress,
      onPressDebounceWait,
    }

    return (
      <InteractionPressable
        ref={ref}
        {...pressableProps}
        accessibilityRole={pressableProps.accessibilityRole ?? 'button'}
        disabled={isDisabled}
        onPress={onPress}
        onPressDebounceWait={onPressDebounceWait}
        style={({ pressed }) => {
          const state: ButtonStyleState = { pressed, disabled: isDisabled, loading }
          const resolved = getButtonStyles(themeToken, buttonToken, buttonProps, state)
          const semantic = resolveStyles(styles, { props: buttonProps, state })
          const groupConnectedStyle = getButtonGroupConnectedStyle(
            groupContext.position,
            typeof resolved.root.borderWidth === 'number' ? resolved.root.borderWidth : 0,
            groupContext.block,
          )
          return [resolved.root, groupConnectedStyle, semantic?.root, style]
        }}
      >
        {({ pressed }) => {
          const state: ButtonStyleState = { pressed, disabled: isDisabled, loading }
          const resolved = getButtonStyles(themeToken, buttonToken, buttonProps, state)
          const semantic = resolveStyles(styles, { props: buttonProps, state })
          const content = loading ? loadingText : children

          return (
            <>
              <View style={[resolved.contentContainer, semantic?.contentContainer]}>
                {icon && iconPosition === 'left' ? (
                  <View style={[resolved.icon, semantic?.icon]}>{icon}</View>
                ) : null}
                {loading ? (
                  <View style={[resolved.icon, semantic?.icon]}>
                    <Loading
                      color={resolved.iconColor}
                      size={loadingSize ?? resolved.label.fontSize ?? buttonToken.contentFontSize}
                      type={loadingType}
                      style={resolved.loadingIcon}
                    />
                  </View>
                ) : null}
                {content !== undefined ? (
                  isTextContent(content) ? (
                    <Text style={[resolved.label, semantic?.label, semantic?.content]}>
                      {content}
                    </Text>
                  ) : (
                    content
                  )
                ) : null}
                {icon && iconPosition === 'right' ? (
                  <View style={[resolved.icon, semantic?.icon]}>{icon}</View>
                ) : null}
              </View>
              {pressed && !isDisabled && resolvedVariant !== 'text' ? (
                <View
                  pointerEvents="none"
                  style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: buttonToken.pressedOverlayColor },
                  ]}
                />
              ) : null}
            </>
          )
        }}
      </InteractionPressable>
    )
  },
)

InternalButton.displayName = 'Button'

export const Button = Object.assign(InternalButton, {
  Group: ButtonGroup,
})
