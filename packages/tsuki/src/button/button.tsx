import { cva, type VariantProps } from 'class-variance-authority'
import { Children, createElement, forwardRef } from 'react'
import type { ComponentRef, ReactNode, RefAttributes } from 'react'
import { ActivityIndicator, View } from 'react-native'
import type { Pressable, ViewProps } from 'react-native'
import { PressableRuntime } from '../pressable/pressable'
import type { PressFeedback, PressableRuntimeProps } from '../pressable/types'
import { semanticClassName } from '../style/semantic'
import { Text } from '../text'
import { TextClassContext } from '../text/context'
import { useTsukiTheme } from '../theme/theme'
import type { ButtonPressFeedback, ButtonProps } from './types'

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-tsuki-button bg-tsuki-primary h-tsuki-button px-4',
  {
    variants: {
      variant: {
        solid: 'bg-tsuki-primary',
        outlined: 'border border-tsuki-border bg-tsuki-surface',
        ghost: 'bg-transparent',
        link: 'bg-transparent',
      },
      size: {
        small: 'h-9 px-3',
        medium: 'h-tsuki-button px-4',
        large: 'h-12 px-5',
      },
      shape: {
        default: 'rounded-tsuki-button',
        round: 'rounded-full',
        circle: 'rounded-full px-0',
      },
    },
    compoundVariants: [
      { variant: 'link', shape: 'default', className: 'h-auto px-0' },
      { variant: 'link', shape: 'round', className: 'h-auto px-0' },
      { shape: 'circle', size: 'small', className: 'w-9' },
      { shape: 'circle', size: 'medium', className: 'w-tsuki-button' },
      { shape: 'circle', size: 'large', className: 'w-12' },
    ],
    defaultVariants: { variant: 'solid', size: 'medium', shape: 'default' },
  },
)

type ButtonVariants = VariantProps<typeof buttonVariants>

const LINK_HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 } as const

function hasRenderableChildren(children: ReactNode): boolean {
  return Children.toArray(children).some(
    (child) => child !== '' && child !== null && child !== undefined && typeof child !== 'boolean',
  )
}

function resolvePressFeedback(pressFeedback: ButtonPressFeedback): PressFeedback {
  switch (pressFeedback) {
    case 'opacity':
      return { mode: 'opacity' }
    case 'overlay':
      return { mode: 'overlay' }
    case 'none':
      return { mode: 'none' }
    case 'scale':
    default:
      return { mode: 'scale', pressedScale: 0.98 }
  }
}

export const Button = forwardRef<ComponentRef<typeof Pressable>, ButtonProps>(function Button(
  {
    children,
    icon,
    variant = 'solid',
    size = 'medium',
    shape = 'default',
    pressFeedback,
    loading = false,
    disabled = false,
    className,
    classNames,
    style,
    styles,
    hitSlop,
    accessibilityRole,
    accessibilityState,
    ...pressableProps
  },
  ref,
) {
  const theme = useTsukiTheme()
  const isDisabled = disabled || loading
  const hasChildren = hasRenderableChildren(children)
  const resolvedPressFeedback = pressFeedback ?? (variant === 'link' ? 'opacity' : 'scale')
  const resolvedHitSlop = hitSlop ?? (variant === 'link' ? LINK_HIT_SLOP : undefined)
  const rootClassName = semanticClassName(
    classNames,
    'root',
    [
      buttonVariants({ variant, size, shape } satisfies ButtonVariants),
      resolvedPressFeedback === 'overlay' ? 'overflow-hidden' : undefined,
      isDisabled ? 'opacity-tsuki-button-disabled-opacity' : undefined,
    ],
    className,
  )
  const contentColorClassName =
    variant === 'solid'
      ? 'text-tsuki-primary-foreground'
      : variant === 'link'
        ? 'text-tsuki-primary'
        : 'text-tsuki-foreground'
  const contentClassName = semanticClassName(classNames, 'content', [
    'text-sm font-semibold',
    contentColorClassName,
  ])
  const iconClassName = semanticClassName(classNames, 'icon', hasChildren ? 'mr-2' : undefined)
  const iconContainerProps = {
    className: iconClassName,
    style: styles?.icon,
    pointerEvents: 'none',
  } as ViewProps
  const content =
    typeof children === 'string' || typeof children === 'number'
      ? createElement(Text, { style: styles?.content }, children)
      : children
  const indicatorColor =
    variant === 'solid'
      ? theme.semantic.colorPrimaryForeground
      : variant === 'link'
        ? theme.semantic.colorPrimary
        : theme.semantic.colorForeground
  const leadingContent = loading
    ? createElement(
        View,
        iconContainerProps,
        createElement(ActivityIndicator, {
          accessible: false,
          color: indicatorColor,
          size: 'small',
        }),
      )
    : icon != null && icon !== false
      ? createElement(View, iconContainerProps, icon)
      : null

  return createElement(
    PressableRuntime,
    {
      ...pressableProps,
      ref,
      feedback: resolvePressFeedback(resolvedPressFeedback),
      hitSlop: resolvedHitSlop,
      disabled: isDisabled,
      accessibilityState: {
        ...accessibilityState,
        disabled: isDisabled || accessibilityState?.disabled,
        busy: loading || accessibilityState?.busy,
      },
      accessibilityRole: accessibilityRole ?? 'button',
      className: rootClassName,
      // NativeWind v4 and v5 resolve this inline style after the className utilities.
      style: [styles?.root, style],
    } as PressableRuntimeProps & RefAttributes<ComponentRef<typeof Pressable>>,
    leadingContent,
    createElement(TextClassContext.Provider, { value: contentClassName }, content),
  )
})

Button.displayName = 'Button'
