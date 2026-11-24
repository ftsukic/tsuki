import { createElement, forwardRef, useContext } from 'react'
import type { ComponentRef, RefAttributes } from 'react'
import { View } from 'react-native'
import type { Pressable, ViewProps } from 'react-native'
import { Divider } from '../divider'
import { PressableRuntime } from '../pressable/pressable'
import type { PressableRuntimeProps } from '../pressable/types'
import { cn } from '../style/cn'
import { semanticClassName } from '../style/semantic'
import { useTsukiTheme } from '../theme/theme'
import { CellLayout } from './cell-layout'
import { CellGroupContext } from './context'
import type { CellProps } from './types'

export const TSUKI_CELL_MARKER = Symbol.for('tsuki.cell')

export const CellRoot = forwardRef<ComponentRef<typeof View>, CellProps>(function Cell(
  {
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
  },
  ref,
) {
  const { semantic } = useTsukiTheme()
  const position = useContext(CellGroupContext)
  const interactive = clickable ?? Boolean(onPress || onLongPress)
  const showDivider = border && (divider ?? (position !== null && position !== 'last'))
  const rootClassName = semanticClassName(
    classNames,
    'root',
    ['bg-tsuki-surface', disabled ? 'opacity-tsuki-cell-disabled-opacity' : undefined],
    className,
  )
  const rootStyle = [styles?.root, style]
  const commonProps = {
    ...viewProps,
    ref,
    className: rootClassName,
    style: rootStyle,
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
          className={cn(
            'absolute bottom-0 left-0 right-0 h-tsuki-cell-divider-width mx-tsuki-cell-padding-horizontal',
            classNames?.divider,
          )}
          style={styles?.divider}
        />
      )}
    </>
  )

  if (!interactive) {
    return createElement(
      View,
      commonProps as ViewProps & RefAttributes<ComponentRef<typeof View>>,
      layout,
    )
  }

  return createElement(
    PressableRuntime,
    {
      ...commonProps,
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
      onPressIn,
      onPressOut,
      feedback: {
        mode: 'background',
        idleColor: semantic.colorSurface,
        pressedColor: semantic.colorBorder,
      },
    } as PressableRuntimeProps & RefAttributes<ComponentRef<typeof Pressable>>,
    layout,
  )
})

CellRoot.displayName = 'Cell'

Object.defineProperty(CellRoot, TSUKI_CELL_MARKER, { value: true })
