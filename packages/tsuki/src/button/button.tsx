import { cva, type VariantProps } from 'class-variance-authority'
import { createElement, forwardRef } from 'react'
import type { ComponentRef, RefAttributes } from 'react'
import { ActivityIndicator, Pressable, View } from 'react-native'
import type { PressableProps, ViewProps } from 'react-native'
import { semanticClassName } from '../style/semantic'
import { Text } from '../text'
import { TextClassContext } from '../text/context'
import { useTsukiTheme } from '../theme/theme'
import type { ButtonProps } from './types'

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-tsuki-button bg-tsuki-primary h-tsuki-button px-4',
  {
    variants: {
      variant: {
        solid: 'bg-tsuki-primary',
        outlined: 'border border-tsuki-border bg-tsuki-surface',
        ghost: 'bg-transparent',
      },
      size: {
        small: 'h-9 px-3',
        medium: 'h-tsuki-button px-4',
        large: 'h-12 px-5',
      },
    },
    defaultVariants: { variant: 'solid', size: 'medium' },
  },
)

type ButtonVariants = VariantProps<typeof buttonVariants>

export const Button = forwardRef<ComponentRef<typeof Pressable>, ButtonProps>(function Button(
  {
    children,
    icon,
    variant = 'solid',
    size = 'medium',
    loading = false,
    disabled = false,
    className,
    classNames,
    style,
    styles,
    accessibilityRole,
    accessibilityState,
    ...pressableProps
  },
  ref,
) {
  const theme = useTsukiTheme()
  const rootClassName = semanticClassName(
    classNames,
    'root',
    buttonVariants({ variant, size } satisfies ButtonVariants),
    className,
  )
  const contentClassName = semanticClassName(
    classNames,
    'content',
    'text-sm font-semibold',
    variant === 'solid' ? 'text-tsuki-primary-foreground' : 'text-tsuki-foreground',
  )
  const iconClassName = semanticClassName(classNames, 'icon', 'mr-2')
  const iconContainerProps = {
    className: iconClassName,
    style: styles?.icon,
    pointerEvents: 'none',
  } as ViewProps
  const content =
    typeof children === 'string' || typeof children === 'number'
      ? createElement(Text, { style: styles?.content }, children)
      : children
  const leadingContent = loading
    ? createElement(
        View,
        iconContainerProps,
        createElement(ActivityIndicator, {
          accessible: false,
          color:
            variant === 'solid'
              ? theme.semantic.colorPrimaryForeground
              : theme.semantic.colorForeground,
          size: 'small',
        }),
      )
    : icon != null && icon !== false
      ? createElement(View, iconContainerProps, icon)
      : null

  return createElement(
    Pressable,
    {
      ...pressableProps,
      ref,
      disabled: disabled || loading,
      accessibilityState: {
        ...accessibilityState,
        disabled: disabled || loading || accessibilityState?.disabled,
        busy: loading || accessibilityState?.busy,
      },
      accessibilityRole: accessibilityRole ?? 'button',
      className: rootClassName,
      // NativeWind v4 and v5 resolve this inline style after the className utilities.
      style: [styles?.root, style],
    } as PressableProps & RefAttributes<ComponentRef<typeof Pressable>>,
    leadingContent,
    createElement(TextClassContext.Provider, { value: contentClassName }, content),
  )
})

Button.displayName = 'Button'
