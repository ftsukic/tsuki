import { usePersistFn } from '../hooks'
import { useToken } from '../theme'
import type { WaterMarkProps } from './interface'
import { getWaterMarkPositions, resolveWaterMarkWidth } from './water-mark-layout'
import { memo, useState } from 'react'
import { Text, View, type LayoutChangeEvent, type TextLayoutEvent, StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%', overflow: 'hidden' },
  marks: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, flexDirection: 'row' },
  mark: { position: 'absolute' },
  measureText: { position: 'absolute', left: 0, top: 0, opacity: 0 },
})

export function WaterMark({
  theme,
  text,
  color,
  fontSize,
  opacity,
  width,
  height,
  gap,
  offset,
  textWidth,
  textHeight,
  rotate = -45,
  foreground = false,
  children,
  style,
  onLayout,
  ...props
}: WaterMarkProps) {
  const { components } = useToken()
  const token = { ...components.WaterMark, ...theme }
  const [measure, setMeasure] = useState({ width: 0, height: 0 })
  const [measuredTextWidth, setMeasuredTextWidth] = useState(0)
  const resolvedFontSize = fontSize ?? token.textFontSize
  const shouldMeasureText = width === undefined && textWidth === undefined
  const onLayoutWrapper = usePersistFn((event: LayoutChangeEvent) => {
    onLayout?.(event)
    setMeasure(event.nativeEvent.layout)
  })
  const onTextLayout = usePersistFn((event: TextLayoutEvent) => {
    const nextWidth = Math.ceil(Math.max(...event.nativeEvent.lines.map((line) => line.width), 0))

    setMeasuredTextWidth((currentWidth) => (currentWidth === nextWidth ? currentWidth : nextWidth))
  })
  const renderMarks = () => {
    const markWidth = resolveWaterMarkWidth(width, textWidth, measuredTextWidth)
    const markHeight = height ?? textHeight ?? 64
    const positions = getWaterMarkPositions({
      containerWidth: measure.width,
      containerHeight: measure.height,
      markWidth,
      markHeight,
      gap,
      offset,
    })

    if (!positions.length) return null

    return (
      <View pointerEvents="none" style={styles.marks}>
        {positions.map(({ column, row, left, top }) => (
          <Text
            key={`${column}-${row}`}
            style={[
              styles.mark,
              {
                color: color ?? token.textColor,
                fontSize: resolvedFontSize,
                width: markWidth,
                height: markHeight,
                left,
                top,
                lineHeight: markHeight,
                textAlign: 'center',
                opacity: opacity ?? token.textOpacity,
                transform: [{ rotateZ: `${rotate}deg` }],
              },
            ]}
            numberOfLines={1}
          >
            {text}
          </Text>
        ))}
      </View>
    )
  }
  return (
    <View {...props} onLayout={onLayoutWrapper} style={[styles.root, style]}>
      {shouldMeasureText ? (
        <Text
          accessible={false}
          pointerEvents="none"
          onTextLayout={onTextLayout}
          style={[styles.measureText, { fontSize: resolvedFontSize }]}
        >
          {text}
        </Text>
      ) : null}
      {foreground ? null : renderMarks()}
      {children}
      {foreground ? renderMarks() : null}
    </View>
  )
}

export default memo(WaterMark)
