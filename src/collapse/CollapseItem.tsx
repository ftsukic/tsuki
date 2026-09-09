import { forwardRef, useCallback, useContext, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { View } from 'react-native'
import type { LayoutChangeEvent, View as ViewComponent } from 'react-native'
import Animated, {
  measure,
  runOnUI,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { Icon } from '../icon'
import { Pressable } from '../pressable'
import { Text } from '../text'
import { useComponentToken } from '../theme'
import { CollapseContext } from './context'
import { getCollapseStyles } from './style'
import { getCollapseToken } from './token'
import type { CollapseItemProps } from './types'

function renderTextContent(value: ReactNode, style: Parameters<typeof Text>[0]['style']) {
  if (typeof value === 'string' || typeof value === 'number') {
    return <Text style={style}>{value}</Text>
  }
  return value
}

export const CollapseItem = forwardRef<ViewComponent, CollapseItemProps>(function CollapseItem(
  { name, title, disabled = false, icon, children, style, ...pressableProps },
  ref,
) {
  const context = useContext(CollapseContext)
  const token = useComponentToken('Collapse', getCollapseToken)
  const active = context?.isActive(name) ?? false
  const contentRef = useAnimatedRef<ViewComponent>()
  const height = useSharedValue(0)
  const contentHeight = useSharedValue(0)
  const expandedProgress = useSharedValue(active ? 1 : 0)
  const didMount = useRef(false)
  const duration = Math.max(0, token.animationDuration)

  const measureContent = useCallback(
    (event: LayoutChangeEvent) => {
      const fallbackHeight = event.nativeEvent.layout.height
      runOnUI((shouldExpand: boolean, fallback: number) => {
        'worklet'

        const measured = measure(contentRef)
        const nextHeight = measured?.height || fallback
        if (!nextHeight) return

        const isFirstMeasurement = contentHeight.value === 0
        contentHeight.value = nextHeight
        if (isFirstMeasurement) {
          height.value = shouldExpand ? nextHeight : 0
        } else if (shouldExpand && height.value !== nextHeight) {
          height.value = withTiming(nextHeight, { duration })
        }
      })(active, fallbackHeight)
    },
    [active, contentHeight, contentRef, duration, height],
  )

  useEffect(() => {
    const immediate = !didMount.current
    didMount.current = true

    runOnUI((shouldExpand: boolean, setImmediately: boolean) => {
      'worklet'

      const targetHeight = shouldExpand ? contentHeight.value : 0
      height.value = setImmediately ? targetHeight : withTiming(targetHeight, { duration })
      expandedProgress.value = setImmediately
        ? shouldExpand
          ? 1
          : 0
        : withTiming(shouldExpand ? 1 : 0, { duration })
    })(active, immediate)
  }, [active, contentHeight, duration, expandedProgress, height])

  const animatedHeightStyle = useAnimatedStyle(() => ({ height: height.value }))
  const animatedArrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${expandedProgress.value * 90}deg` }],
  }))

  if (!context) return null

  const resolvedStyles = getCollapseStyles(token, {
    active,
    disabled,
    pressed: false,
  })

  return (
    <View ref={ref}>
      <Pressable
        {...pressableProps}
        accessibilityRole={pressableProps.accessibilityRole ?? 'button'}
        accessibilityState={{
          ...pressableProps.accessibilityState,
          disabled,
          expanded: active,
        }}
        disabled={disabled}
        onPress={() => context.toggle(name)}
        pressStyle="none"
        style={({ pressed }) => [
          getCollapseStyles(token, { active, disabled, pressed }).header,
          style,
        ]}
      >
        {icon ? <View style={resolvedStyles.icon}>{icon}</View> : null}
        {typeof title === 'string' || typeof title === 'number' ? (
          <Text style={resolvedStyles.title}>{title}</Text>
        ) : (
          title
        )}
        <Animated.View pointerEvents="none" style={[resolvedStyles.arrow, animatedArrowStyle]}>
          <Icon name="RightOutlined" size={token.iconSize} color={token.iconColor} />
        </Animated.View>
      </Pressable>
      <Animated.View style={[resolvedStyles.contentWrapper, animatedHeightStyle]}>
        <View
          ref={contentRef}
          collapsable={false}
          onLayout={measureContent}
          style={resolvedStyles.content}
        >
          {renderTextContent(children, resolvedStyles.contentText)}
        </View>
      </Animated.View>
    </View>
  )
})

CollapseItem.displayName = 'CollapseItem'
