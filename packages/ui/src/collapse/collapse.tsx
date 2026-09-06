import { Card } from '../card'
import { Cell } from '../cell'
import { Divider } from '../divider'
import { easing, getArrowIconName } from '../helpers'
import { useControllableValue, usePersistFn } from '../hooks'
import { Icon } from '../icon'
import { useToken } from '../theme'
import type { CollapseProps } from './interface'
import isUndefined from 'lodash/isUndefined'
import { memo, useCallback, useEffect, useRef } from 'react'
import { Animated, View } from 'react-native'

export function Collapse({
  children,
  theme,
  title,
  titleStyle,
  titleTextStyle,
  iconStyle,
  iconColor,
  iconSize,
  bodyStyle,
  renderTitle,
  renderTitleExtra,
  renderBody,
  type = 'cell',
  onAnimationEnd,
  bodyPadding = true,
  headerDivider = true,
  bodyDivider = type === 'cell',
  lazyRender = true,
  square = true,
  testID,
  collapse: controlled,
  defaultCollapse,
  onCollapse,
}: CollapseProps) {
  const { components } = useToken()
  const token = { ...components.Collapse, ...theme }
  const [expanded, setExpanded] = useControllableValue<boolean>(
    controlled === undefined
      ? { defaultValue: defaultCollapse, onChange: onCollapse }
      : { value: controlled, onChange: onCollapse },
  )
  const visible = Boolean(expanded)
  const height = useRef(0)
  const mounted = useRef(false)
  const animatedHeight = useRef(new Animated.Value(0)).current
  const onEnd = usePersistFn((value: boolean) => onAnimationEnd?.(value))
  const toggle = useCallback(
    (value: boolean, immediate = false) => {
      const action = Animated.timing(animatedHeight, {
        toValue: value ? height.current : 0,
        duration: immediate ? 0 : token.transitionDuration,
        easing: value ? easing.easeOutCirc : easing.easeInCubic,
        useNativeDriver: false,
      })
      action.start(({ finished }) => {
        if (finished) onEnd(value)
      })
    },
    [animatedHeight, onEnd, token.transitionDuration],
  )
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  useEffect(() => {
    toggle(visible)
  }, [toggle, visible])
  const titleNode = renderTitle ? renderTitle(visible) : title
  const arrowName = getArrowIconName(visible ? 'up' : 'down')
  const arrow = (
    <Icon
      name={arrowName}
      style={iconStyle}
      color={isUndefined(iconColor) ? token.iconColor : iconColor}
      size={iconSize ?? token.iconSize}
    />
  )
  const extra = renderTitleExtra ? renderTitleExtra(visible, arrow) : arrow
  const body =
    lazyRender && !mounted.current && !visible ? null : renderBody ? renderBody() : children
  const bodyNode = (
    <Animated.View
      style={{ height: animatedHeight, overflow: 'hidden', backgroundColor: token.backgroundColor }}
    >
      <View
        collapsable={false}
        onLayout={(event) => {
          height.current = event.nativeEvent.layout.height
          if (visible) toggle(true, true)
        }}
        style={{ position: 'absolute', left: 0, right: 0, top: 0 }}
      >
        <View
          style={[
            bodyPadding && {
              paddingHorizontal: token.bodyPaddingHorizontal,
              paddingVertical: token.bodyPaddingVertical,
            },
            bodyStyle,
          ]}
        >
          {body}
        </View>
        {bodyDivider ? <Divider style={{ marginHorizontal: token.bodyPaddingHorizontal }} /> : null}
      </View>
    </Animated.View>
  )
  if (type === 'card')
    return (
      <Card
        square={square}
        title={titleNode}
        extra={extra}
        headerDivider={headerDivider}
        titleStyle={titleStyle}
        titleTextStyle={titleTextStyle}
        bodyPadding={false}
        onPressHeader={() => setExpanded(!visible)}
      >
        {bodyNode}
      </Card>
    )
  return (
    <>
      <Cell
        title={titleNode}
        style={titleStyle}
        titleTextStyle={titleTextStyle}
        valueExtra={extra}
        onPress={() => setExpanded(!visible)}
        divider={headerDivider}
        testID={testID}
      />
      {bodyNode}
    </>
  )
}

export default memo(Collapse)
