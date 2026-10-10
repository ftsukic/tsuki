import { forwardRef, useContext } from 'react'
import type { ReactNode } from 'react'
import { View } from 'react-native'
import type { View as ViewComponent } from 'react-native'
import Animated from 'react-native-reanimated'
import { useCollapseMotion } from '../motion/useCollapseMotion'
import { Icon } from '../icon'
import { Pressable } from '../pressable'
import { Text } from '../text'
import { useComponentToken } from '../theme'
import { CollapseContext } from './context'
import { getCollapseHeaderDividerStyle, getCollapseStyles } from './style'
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
  const { contentRef, measureContent, animatedHeightStyle, animatedArrowStyle } = useCollapseMotion(
    active,
    token.animationDuration,
  )

  if (!context) return null

  const resolvedStyles = getCollapseStyles(token, {
    active,
    disabled,
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
        pressStyle="background"
        pressedBackgroundColor={token.headerPressedBackgroundColor}
        style={[resolvedStyles.header, style]}
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
        {context.border && active ? (
          <View pointerEvents="none" style={getCollapseHeaderDividerStyle(token)} />
        ) : null}
      </Pressable>
      <Animated.View
        pointerEvents={active ? 'auto' : 'none'}
        accessibilityElementsHidden={!active}
        importantForAccessibility={active ? 'auto' : 'no-hide-descendants'}
        style={[resolvedStyles.contentWrapper, animatedHeightStyle]}
      >
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
