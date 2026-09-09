import { forwardRef, useCallback, useContext, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { View } from 'react-native'
import type { LayoutChangeEvent, View as ViewComponent } from 'react-native'
import Animated, {
  Easing,
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
import { useComponentToken, useToken } from '../theme'
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
  const { token: themeToken } = useToken()
  const active = context?.isActive(name) ?? false
  const contentRef = useAnimatedRef<ViewComponent>()
  const height = useSharedValue(0)
  const contentHeight = useSharedValue(0)
  const isAnimating = useSharedValue(false)
  const pendingExpansion = useSharedValue(false)
  const expandedProgress = useSharedValue(active ? 1 : 0)
  const hasMeasured = useSharedValue(false)
  const didMount = useRef(false)
  const duration = themeToken.motion ? Math.max(0, token.animationDuration) : 0

  const measureContent = useCallback(
    (event: LayoutChangeEvent) => {
      const fallbackHeight = event.nativeEvent.layout.height
      runOnUI((shouldExpand: boolean, fallback: number) => {
        'worklet'

        const measured = measure(contentRef)
        const nextHeight = measured?.height || fallback
        if (!nextHeight) return

        const isFirstMeasurement = !hasMeasured.value
        const shouldAnimateOpening = isFirstMeasurement && pendingExpansion.value && shouldExpand
        contentHeight.value = nextHeight
        hasMeasured.value = true

        if (shouldAnimateOpening) {
          pendingExpansion.value = false
          isAnimating.value = true
          height.value = withTiming(
            nextHeight,
            { duration, easing: Easing.inOut(Easing.ease) },
            (finished) => {
              if (finished) isAnimating.value = false
            },
          )
        } else if (isFirstMeasurement) {
          height.value = shouldExpand ? nextHeight : 0
        } else if (shouldExpand && !isAnimating.value && height.value !== nextHeight) {
          height.value = nextHeight
        }
      })(active, fallbackHeight)
    },
    [
      active,
      contentHeight,
      contentRef,
      duration,
      hasMeasured,
      height,
      isAnimating,
      pendingExpansion,
    ],
  )

  useEffect(() => {
    const immediate = !didMount.current
    didMount.current = true

    runOnUI((shouldExpand: boolean, setImmediately: boolean) => {
      'worklet'

      const targetHeight = shouldExpand ? contentHeight.value : 0
      const timingConfig = { duration, easing: Easing.inOut(Easing.ease) }

      if (setImmediately) {
        pendingExpansion.value = false
        isAnimating.value = false
        height.value = targetHeight
        expandedProgress.value = shouldExpand ? 1 : 0
        return
      }

      if (!hasMeasured.value && shouldExpand) {
        pendingExpansion.value = true
        height.value = 0
      } else {
        pendingExpansion.value = false
        isAnimating.value = true
        height.value = withTiming(targetHeight, timingConfig, (finished) => {
          if (finished) isAnimating.value = false
        })
      }

      expandedProgress.value = withTiming(shouldExpand ? 1 : 0, timingConfig)
    })(active, immediate)
  }, [
    active,
    contentHeight,
    duration,
    expandedProgress,
    hasMeasured,
    height,
    isAnimating,
    pendingExpansion,
  ])

  const animatedHeightStyle = useAnimatedStyle(() => ({ height: height.value }))
  const animatedArrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${90 - expandedProgress.value * 180}deg` }],
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
          <Icon
            name="RightOutlined"
            size={token.iconSize}
            color={disabled ? token.disabledColor : token.iconColor}
          />
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
