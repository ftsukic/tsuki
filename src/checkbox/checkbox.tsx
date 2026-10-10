import { MOTION_SCALE } from '../motion/token'
import { MotionView } from '../motion/motion-view'
import { Icon } from '../icon'
import { Pressable } from '../pressable'
import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
import { CheckboxGroupContext } from './context'
import { useCheckboxState } from './state'
import type { CheckboxProps, CheckboxStyleState } from './types'
import { getCheckboxStyles } from './style'
import { getCheckboxToken } from './token'
import { forwardRef, useCallback, useContext, useEffect, useRef } from 'react'
import { View } from 'react-native'
import type { ReactNode } from 'react'
import { Text } from '../text'

function isTextContent(value: ReactNode): value is string | number {
  return typeof value === 'string' || typeof value === 'number'
}

function warnMissingName() {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.error('Checkbox inside Checkbox.Group must provide a name.')
  }
}

export const Checkbox = forwardRef<React.ComponentRef<typeof Pressable>, CheckboxProps>(
  function Checkbox(
    {
      children,
      name,
      checked,
      indeterminate = false,
      defaultChecked = false,
      disabled = false,
      iconSize,
      shape = 'round',
      labelPosition = 'right',
      variant,
      buttonVariant,
      style,
      styles,
      onPress,
      onChange,
      onPressDebounceWait,
      ...pressableProps
    },
    ref,
  ) {
    const checkboxToken = useComponentToken('Checkbox', getCheckboxToken)
    const group = useContext(CheckboxGroupContext)
    const warnedMissingName = useRef(false)
    const effectiveDisabled = disabled || Boolean(group?.disabled)
    const standaloneState = useCheckboxState({
      checked,
      defaultChecked,
      disabled: effectiveDisabled,
    })
    const isGrouped = group !== undefined
    const resolvedVariant = variant ?? group?.variant ?? 'default'
    const resolvedButtonVariant = buttonVariant ?? group?.buttonVariant ?? 'solid'
    const buttonLayout = group?.buttonLayout ?? 'intrinsic'
    const isChecked = isGrouped
      ? group.value.some((item) => Object.is(item, name))
      : standaloneState.checked

    useEffect(() => {
      if (group && name === undefined && !warnedMissingName.current) {
        warnedMissingName.current = true
        warnMissingName()
      }
    }, [group, name])

    const handlePress = useCallback<NonNullable<CheckboxProps['onPress']>>(
      (event) => {
        if (effectiveDisabled) return

        onPress?.(event)

        if (isGrouped) {
          if (name === undefined) return
          const nextChecked = group.toggle(name)
          onChange?.(nextChecked)
          return
        }

        const nextChecked = standaloneState.toggle()
        onChange?.(nextChecked)
      },
      [effectiveDisabled, group, isGrouped, name, onChange, onPress, standaloneState],
    )

    const checkboxProps: CheckboxProps = {
      children,
      name,
      checked: isChecked,
      indeterminate,
      defaultChecked,
      disabled: effectiveDisabled,
      iconSize,
      shape,
      labelPosition,
      variant: resolvedVariant,
      buttonVariant: resolvedButtonVariant,
      style,
      styles,
      onChange,
      onPress,
      onPressDebounceWait,
    }

    return (
      <Pressable
        ref={ref}
        {...pressableProps}
        accessibilityRole={pressableProps.accessibilityRole ?? 'checkbox'}
        accessibilityState={{
          ...pressableProps.accessibilityState,
          checked: indeterminate ? 'mixed' : isChecked,
          disabled: effectiveDisabled,
        }}
        disabled={effectiveDisabled}
        onPress={handlePress}
        onPressDebounceWait={onPressDebounceWait}
        pressStyle="opacity"
        pressedOpacity={checkboxToken.pressedOpacity}
        style={({ pressed }) => {
          const state: CheckboxStyleState = {
            checked: isChecked,
            indeterminate,
            disabled: effectiveDisabled,
            pressed,
          }
          const resolved = getCheckboxStyles(checkboxToken, checkboxProps, state, buttonLayout)
          const semantic = resolveStyles(styles, { props: checkboxProps, state })
          return [resolved.root, semantic?.root, style]
        }}
      >
        {({ pressed }) => {
          const state: CheckboxStyleState = {
            checked: isChecked,
            indeterminate,
            disabled: effectiveDisabled,
            pressed,
          }
          const resolved = getCheckboxStyles(checkboxToken, checkboxProps, state, buttonLayout)
          const semantic = resolveStyles(styles, { props: checkboxProps, state })
          const label = isTextContent(children) ? (
            <Text
              numberOfLines={
                resolvedVariant === 'button' && buttonLayout === 'equal' ? 1 : undefined
              }
              style={[resolved.label, semantic?.label]}
            >
              {children}
            </Text>
          ) : children !== undefined && children !== null && typeof children !== 'boolean' ? (
            <View>{children}</View>
          ) : null

          if (resolvedVariant === 'button') return label

          return (
            <>
              {labelPosition === 'left' ? label : null}
              <View style={[resolved.indicator, semantic?.icon]}>
                {indeterminate ? (
                  <Icon
                    name="MinusOutlined"
                    size={resolved.checkSize}
                    color={resolved.checkColor}
                  />
                ) : isChecked ? (
                  <MotionView
                    pointerEvents="none"
                    initial={{ opacity: 0, scale: MOTION_SCALE.selection }}
                    animate={{ opacity: 1, scale: 1 }}
                    spring="normal"
                  >
                    <Icon
                      name="CheckOutlined"
                      size={resolved.checkSize}
                      color={resolved.checkColor}
                    />
                  </MotionView>
                ) : null}
              </View>
              {labelPosition === 'right' ? label : null}
            </>
          )
        }}
      </Pressable>
    )
  },
)

Checkbox.displayName = 'Checkbox'
