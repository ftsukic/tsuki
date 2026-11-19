import { createElement, useContext, useState } from 'react'
import { Pressable, View } from 'react-native'
import type { ViewStyle } from 'react-native'
import { Divider } from '../divider'
import { cn } from '../style/cn'
import { useTsukiTheme } from '../theme/theme'
import { CellLayout } from './cell-layout'
import { CellGroupContext } from './context'
import { cellSlot } from './style'
import type { CellProps } from './types'

export function CellRoot({
  leading,
  title,
  titleExtra,
  description,
  value,
  valueExtra,
  trailing,
  vertical,
  center,
  valueAlign,
  showArrow,
  required,
  arrowDirection,
  size,
  titleLines,
  valueLines,
  clickable,
  border = true,
  divider,
  disabled = false,
  onPress,
  onLongPress,
  onPressIn,
  onPressOut,
  onPressMove,
  onHoverIn,
  onHoverOut,
  android_disableSound,
  android_ripple,
  pressRetentionOffset,
  delayLongPress,
  unstable_pressDelay,
  testOnly_pressed,
  className,
  classNames,
  style,
  styles,
  accessibilityRole,
  accessibilityState,
  role,
  ...viewProps
}: CellProps) {
  const {
    semantic,
    components: { Cell: tokens },
  } = useTsukiTheme()
  const position = useContext(CellGroupContext)
  const [pressed, setPressed] = useState(false)
  const interactive = clickable ?? Boolean(onPress || onLongPress)
  const showDivider = border && (divider ?? (position !== null && position !== 'last'))
  const root = cellSlot<ViewStyle>(
    {},
    '',
    {
      backgroundColor:
        interactive && !disabled && (pressed || testOnly_pressed)
          ? semantic.colorBorder
          : semantic.colorSurface,
      opacity: disabled ? tokens.disabledOpacity : 1,
    },
    cn(classNames?.root, className),
    [styles?.root, style],
  )
  const props = {
    ...viewProps,
    ...root,
    role,
    accessibilityRole:
      accessibilityRole ?? (interactive && role === undefined ? 'button' : undefined),
    accessibilityState: {
      ...accessibilityState,
      disabled: disabled || accessibilityState?.disabled,
    },
  }
  const layout = (
    <>
      <CellLayout
        leading={leading}
        title={title}
        titleExtra={titleExtra}
        description={description}
        value={value}
        valueExtra={valueExtra}
        trailing={trailing}
        vertical={vertical}
        center={center}
        valueAlign={valueAlign}
        showArrow={showArrow}
        required={required}
        arrowDirection={arrowDirection}
        size={size}
        titleLines={titleLines}
        valueLines={valueLines}
        classNames={classNames}
        styles={styles}
      />
      {showDivider && (
        <Divider
          testID={viewProps.testID ? `${viewProps.testID}-divider` : undefined}
          accessible={false}
          role="none"
          thickness={tokens.dividerWidth}
          inset={tokens.paddingHorizontal}
          className={classNames?.divider}
          style={[{ position: 'absolute', left: 0, right: 0, bottom: 0 }, styles?.divider]}
        />
      )}
    </>
  )

  if (!interactive) return createElement(View, props, layout)

  return createElement(
    Pressable,
    {
      ...props,
      disabled,
      onPress,
      onLongPress,
      onPressMove,
      onHoverIn,
      onHoverOut,
      android_disableSound,
      android_ripple,
      pressRetentionOffset,
      delayLongPress,
      unstable_pressDelay,
      testOnly_pressed,
      onPressIn: (event) => {
        setPressed(true)
        onPressIn?.(event)
      },
      onPressOut: (event) => {
        setPressed(false)
        onPressOut?.(event)
      },
    },
    layout,
  )
}
