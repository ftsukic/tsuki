import DescriptionContext from './context'
import type { DescriptionGroupProps } from './interface'
import { memo, useMemo } from 'react'
import { View } from 'react-native'

export function DescriptionGroup({
  children,
  colon = true,
  contentStyle,
  contentTextStyle,
  labelStyle,
  labelTextStyle,
  labelWidth,
  layout = 'horizontal',
  size = 'm',
  numberOfLines,
  justify,
  align,
  empty = '--',
  showEmpty = false,
  ...props
}: DescriptionGroupProps) {
  const value = useMemo(
    () => ({
      colon,
      contentStyle,
      contentTextStyle,
      labelStyle,
      labelTextStyle,
      labelWidth,
      layout,
      size,
      numberOfLines,
      justify,
      align,
      empty,
      showEmpty,
    }),
    [
      align,
      colon,
      contentStyle,
      contentTextStyle,
      empty,
      justify,
      labelStyle,
      labelTextStyle,
      labelWidth,
      layout,
      numberOfLines,
      showEmpty,
      size,
    ],
  )
  return (
    <DescriptionContext.Provider value={value}>
      <View {...props}>{children}</View>
    </DescriptionContext.Provider>
  )
}

export default memo(DescriptionGroup)
