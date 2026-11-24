import { createElement, forwardRef } from 'react'
import type { ComponentRef, RefAttributes } from 'react'
import { TextInput, View } from 'react-native'
import type { TextInputProps, ViewProps } from 'react-native'
import { semanticClassName } from '../style/semantic'
import type { InputProps } from './types'

export const Input = forwardRef<ComponentRef<typeof TextInput>, InputProps>(function Input(
  {
    disabled = false,
    editable,
    error,
    prefix,
    suffix,
    className,
    classNames,
    style,
    styles,
    accessibilityState,
    accessibilityHint,
    ...textInputProps
  },
  ref,
) {
  const hasError = Boolean(error)
  const isMultiline = Boolean(textInputProps.multiline)
  const rootClassName = semanticClassName(
    classNames,
    'root',
    [
      'w-full flex-row items-center rounded-tsuki-input border border-tsuki-border bg-tsuki-surface px-3',
      isMultiline ? 'min-h-tsuki-input py-2' : 'h-tsuki-input',
      hasError ? 'border-tsuki-danger' : undefined,
      disabled ? 'opacity-tsuki-input-disabled-opacity' : undefined,
    ],
    className,
  )
  const inputClassName = semanticClassName(classNames, 'input', [
    'min-w-0 flex-1 text-tsuki-foreground placeholder:text-tsuki-muted',
    isMultiline ? undefined : 'h-full',
  ])

  const input = createElement(TextInput, {
    ...textInputProps,
    ref,
    accessibilityHint: error
      ? [accessibilityHint, error].filter(Boolean).join('. ')
      : accessibilityHint,
    accessibilityState: {
      ...accessibilityState,
      disabled: disabled || accessibilityState?.disabled,
    },
    className: inputClassName,
    editable: disabled ? false : editable,
    style: styles?.input,
  } as TextInputProps & RefAttributes<ComponentRef<typeof TextInput>>)

  return createElement(
    View,
    // NativeWind v4 and v5 resolve this inline style after the className utilities.
    { className: rootClassName, style: [styles?.root, style] } as ViewProps,
    prefix != null && prefix !== false
      ? createElement(
          View,
          {
            className: semanticClassName(classNames, 'prefix', 'mr-2'),
            style: styles?.prefix,
          } as ViewProps,
          prefix,
        )
      : null,
    input,
    suffix != null && suffix !== false
      ? createElement(
          View,
          {
            className: semanticClassName(classNames, 'suffix', 'ml-2'),
            style: styles?.suffix,
          } as ViewProps,
          suffix,
        )
      : null,
  )
})

Input.displayName = 'Input'
