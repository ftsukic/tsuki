import { Loading } from '../loading'
import { Pressable } from '../pressable'
import { resolveStyles } from '../style'
import { useComponentToken, useToken } from '../theme'
import { ButtonGroupContext } from './context'
import { ButtonGroup, getButtonGroupConnectedStyle } from './button-group'
import { getButtonStyles, shouldUseButtonOverlay } from './style'
import { getButtonToken } from './token'
import type { ButtonProps, ButtonStyleState } from './types'
import { Fragment, forwardRef, isValidElement, useContext, useEffect } from 'react'
import { View } from 'react-native'
import type { ReactNode } from 'react'
import { Text } from '../text'

function isTextContent(value: ReactNode): value is string | number {
  return typeof value === 'string' || typeof value === 'number'
}

function renderViewContent(
  value: ReactNode,
  renderText: (text: string | number) => ReactNode,
): ReactNode {
  if (isTextContent(value)) return renderText(value)

  if (Array.isArray(value)) {
    return value.map((child, index) => (
      <Fragment key={index}>{renderViewContent(child, renderText)}</Fragment>
    ))
  }

  if (isValidElement<{ children?: ReactNode }>(value) && value.type === Fragment) {
    return renderViewContent(value.props.children, renderText)
  }

  return value
}

const InternalButton = forwardRef<React.ComponentRef<typeof Pressable>, ButtonProps>(
  function Button(
    {
      children,
      type = 'default',
      danger,
      success,
      warning,
      size,
      color,
      variant,
      pressFeedback,
      pressedOverlayColor,
      shape,
      block = false,
      round = false,
      square = false,
      circle = false,
      hairline = false,
      disabled = false,
      loading = false,
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
    const resolvedVariant = variant ?? groupContext.variant
    const buttonProps = {
      children,
      type,
      danger,
      success,
      warning,
      size: mergedSize,
      color,
      variant: resolvedVariant,
      pressFeedback,
      pressedOverlayColor,
      shape: mergedShape,
      block,
      round,
      square,
      circle,
      hairline,
      disabled,
      loading,
      loadingType,
      loadingSize,
      icon,
      iconPosition,
      style,
      styles,
      onPress,
      onPressDebounceWait,
    } as ButtonProps
    useEffect(() => {
      if (__DEV__ && [danger, success, warning].filter(Boolean).length > 1) {
        console.warn(
          'Button: danger, success and warning are mutually exclusive; using danger > warning > success.',
        )
      }
    }, [danger, success, warning])
    return (
      <Pressable
        ref={ref}
        {...pressableProps}
        accessibilityRole={pressableProps.accessibilityRole ?? 'button'}
        disabled={isDisabled}
        pressStyle={shouldUseButtonOverlay(buttonProps) ? 'overlay' : 'opacity'}
        pressedOpacity={buttonToken.pressedOpacity}
        pressedOverlayColor={pressedOverlayColor ?? buttonToken.pressedOverlayColor}
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
          const content = children
          const renderedContent = renderViewContent(content, (text) => (
            <Text style={[resolved.content, semantic?.content]}>{text}</Text>
          ))

          const iconNode = loading ? (
            <View style={[resolved.icon, semantic?.icon]}>
              <Loading
                color={resolved.iconColor}
                size={loadingSize ?? resolved.content.fontSize ?? buttonToken.contentFontSize}
                type={loadingType}
              />
            </View>
          ) : icon ? (
            <View style={[resolved.icon, semantic?.icon]}>
              {renderViewContent(icon, (text) => (
                <Text>{text}</Text>
              ))}
            </View>
          ) : null

          return (
            <>
              {iconPosition === 'left' ? iconNode : null}
              {renderedContent}
              {iconPosition === 'right' ? iconNode : null}
            </>
          )
        }}
      </Pressable>
    )
  },
)

InternalButton.displayName = 'Button'

export const Button = Object.assign(InternalButton, {
  Group: ButtonGroup,
})
