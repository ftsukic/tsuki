import { useContext, useMemo } from 'react'
import { StyleSheet } from 'react-native'
import type { ReactNode } from 'react'
import type { StyleProp, TextStyle } from 'react-native'
import { twMerge } from 'tailwind-merge'
import { TextInheritanceContext } from './context'

export interface TextInheritanceProviderProps {
  children?: ReactNode
  className?: string
  style?: StyleProp<TextStyle>
}

/** Internal bridge for inheriting NativeWind and React Native text styles. */
export function TextInheritanceProvider({
  children,
  className,
  style,
}: TextInheritanceProviderProps) {
  const inherited = useContext(TextInheritanceContext)
  const value = useMemo(() => {
    const mergedStyle = StyleSheet.flatten(style)
    return {
      className: twMerge(inherited?.className, className) || undefined,
      style: inherited?.style || mergedStyle ? { ...inherited?.style, ...mergedStyle } : undefined,
    }
  }, [className, inherited, style])

  return <TextInheritanceContext.Provider value={value}>{children}</TextInheritanceContext.Provider>
}
