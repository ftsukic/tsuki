import type { FlexAlign, FlexItemProps, FlexJustify, FlexProps } from './interface'
import { Pressable, View } from 'react-native'

const justifyMap: Record<
  FlexJustify,
  'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around'
> = {
  around: 'space-around',
  between: 'space-between',
  center: 'center',
  end: 'flex-end',
  start: 'flex-start',
}
const alignMap: Record<FlexAlign, 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch'> = {
  baseline: 'baseline',
  center: 'center',
  end: 'flex-end',
  start: 'flex-start',
  stretch: 'stretch',
}

function hasPressHandler(props: {
  onPress?: unknown
  onLongPress?: unknown
  onPressIn?: unknown
  onPressOut?: unknown
}) {
  return Boolean(props.onPress || props.onLongPress || props.onPressIn || props.onPressOut)
}

export function Flex({
  align = 'center',
  children,
  direction = 'row',
  justify = 'start',
  style,
  wrap = 'nowrap',
  ...restProps
}: FlexProps) {
  const content = (
    <View
      {...restProps}
      style={[
        {
          alignItems: alignMap[align],
          flexDirection: direction,
          flexWrap: wrap,
          justifyContent: justifyMap[justify],
        },
        style,
      ]}
    >
      {children}
    </View>
  )
  return hasPressHandler(restProps) ? (
    <Pressable {...restProps} style={style}>
      {content}
    </Pressable>
  ) : (
    content
  )
}

export function FlexItem({ children, flex = 1, style, ...restProps }: FlexItemProps) {
  const content = (
    <View {...restProps} style={[{ flex }, style]}>
      {children}
    </View>
  )
  return hasPressHandler(restProps) ? (
    <Pressable {...restProps} style={style}>
      {content}
    </Pressable>
  ) : (
    content
  )
}
