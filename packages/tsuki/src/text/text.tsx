import { createElement, forwardRef, useContext } from 'react'
import type { ComponentRef } from 'react'
import { Text as RNText } from 'react-native'
import { cn } from '../style/cn'
import { TextClassContext } from './context'
import { textVariants } from './text-variants'
import type { TextProps } from './types'

export const Text = forwardRef<ComponentRef<typeof RNText>, TextProps>(function Text(
  { children, className, variant, ...nativeProps },
  ref,
) {
  const parentClassName = useContext(TextClassContext)
  const resolvedClassName = cn(textVariants({ variant }), parentClassName, className)
  const props = { ...nativeProps, ref, className: resolvedClassName }

  return (
    <TextClassContext.Provider value={resolvedClassName}>
      {createElement(RNText, props, children)}
    </TextClassContext.Provider>
  )
})
