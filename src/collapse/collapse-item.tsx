import { forwardRef, useContext } from 'react'
import type { ReactNode } from 'react'
import { View } from 'react-native'
import type { View as ViewComponent } from 'react-native'
import Animated from 'react-native-reanimated'
import { useCollapseMotion } from '../motion/useCollapseMotion'
import { Icon } from '../icon'
import { IconSizeProvider } from '../icon/context'
import { Pressable } from '../pressable'
import { resolveStyles } from '../style'
import { Text } from '../text'
import { useComponentToken } from '../theme'
import { CollapseContext } from './context'
import { getCollapseHeaderDividerStyle, getCollapseStyles } from './style'
import { getCollapseToken } from './token'
import type { CollapseItemProps, CollapseItemStyleState } from './types'

function renderTextContent(value: ReactNode, style: Parameters<typeof Text>[0]['style']) {
  if (typeof value === 'string' || typeof value === 'number') {
    return <Text style={style}>{value}</Text>
  }
  return value
}

export const CollapseItem = forwardRef<ViewComponent, CollapseItemProps>(function CollapseItem(
  { name, title, disabled = false, icon, children, style, styles, ...pressableProps },
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

  const state: CollapseItemStyleState = { active, disabled }
  const itemProps: CollapseItemProps = {
    ...pressableProps,
    name,
    title,
    disabled,
    icon,
    children,
    style,
    styles,
  }
  const resolvedStyles = getCollapseStyles(token, state)
  const semantic = resolveStyles(styles, { props: itemProps, state })

  return (
    <View ref={ref} style={[resolvedStyles.root, semantic?.root, style]}>
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
        style={[resolvedStyles.header, semantic?.header]}
      >
        {icon ? (
          <View style={[resolvedStyles.leading, semantic?.leading]}>
            <IconSizeProvider size={token.iconSize}>{icon}</IconSizeProvider>
          </View>
        ) : null}
        <View style={[resolvedStyles.titleContainer, semantic?.titleContainer]}>
          {typeof title === 'string' || typeof title === 'number' ? (
            <Text style={[resolvedStyles.title, semantic?.title]}>{title}</Text>
          ) : (
            title
          )}
        </View>
        <Animated.View pointerEvents="none" style={animatedArrowStyle}>
          <View
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[resolvedStyles.icon, semantic?.icon]}
          >
            <Icon
              name="RightOutlined"
              size={token.iconSize}
              color={disabled ? token.disabledColor : token.iconColor}
            />
          </View>
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
          style={resolvedStyles.contentMeasure}
        >
          <View style={[resolvedStyles.body, semantic?.body]}>
            {renderTextContent(children, [resolvedStyles.bodyText, semantic?.bodyText])}
          </View>
        </View>
      </Animated.View>
    </View>
  )
})

CollapseItem.displayName = 'CollapseItem'
