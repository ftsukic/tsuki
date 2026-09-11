import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
import { Icon } from '../icon'
import { InteractionPressable } from '../interaction'
import { RadioGroupContext } from './context'
import type { RadioProps, RadioStyleState } from './interface'
import { getRadioStyles } from './style'
import { getRadioToken } from './token'
import { forwardRef, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Text, View } from 'react-native'
import type { ReactNode } from 'react'

function isTextContent(value: ReactNode): value is string | number {
  return typeof value === 'string' || typeof value === 'number'
}

function warnMissingValue() {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.error('Radio inside Radio.Group must provide a value.')
  }
}

export const Radio = forwardRef<React.ComponentRef<typeof InteractionPressable>, RadioProps>(
  function Radio(
    {
      children,
      value,
      checked,
      defaultChecked = false,
      disabled = false,
      shape = 'round',
      variant,
      labelPosition = 'right',
      checkedColor,
      style,
      styles,
      onPress,
      onChange,
      ...pressableProps
    },
    ref,
  ) {
    const group = useContext(RadioGroupContext)
    const token = useComponentToken('Radio', getRadioToken)
    const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked)
    const warnedMissingValue = useRef(false)
    const isControlled = checked !== undefined
    const effectiveDisabled = disabled || !!group?.disabled
    const resolvedVariant = variant ?? group?.variant ?? 'default'
    const buttonLayout = group?.buttonLayout ?? 'intrinsic'
    const isChecked = group
      ? value !== undefined && Object.is(group.value, value)
      : isControlled
        ? checked
        : uncontrolledChecked

    useEffect(() => {
      if (group && value === undefined && !warnedMissingValue.current) {
        warnedMissingValue.current = true
        warnMissingValue()
      }
    }, [group, value])

    const handlePress = useCallback<NonNullable<RadioProps['onPress']>>(
      (event) => {
        if (effectiveDisabled) return

        onPress?.(event)

        if (group) {
          if (value === undefined) return

          if (group.select(value)) onChange?.(true)
          return
        }

        if (isChecked) return
        if (!isControlled) setUncontrolledChecked(true)
        onChange?.(true)
      },
      [effectiveDisabled, group, isChecked, isControlled, onChange, onPress, value],
    )

    const radioProps: RadioProps = {
      children,
      value,
      checked: isChecked,
      defaultChecked,
      disabled: effectiveDisabled,
      shape,
      variant: resolvedVariant,
      labelPosition,
      checkedColor,
      style,
      styles,
      onChange,
    }

    return (
      <InteractionPressable
        ref={ref}
        {...pressableProps}
        accessibilityRole={pressableProps.accessibilityRole ?? 'radio'}
        accessibilityState={{
          ...pressableProps.accessibilityState,
          selected: isChecked,
          disabled: effectiveDisabled,
        }}
        disabled={effectiveDisabled}
        onPress={handlePress}
        style={({ pressed }) => {
          const state: RadioStyleState = {
            checked: isChecked,
            disabled: effectiveDisabled,
            pressed,
          }
          const resolved = getRadioStyles(token, radioProps, state, buttonLayout)
          const semantic = resolveStyles(styles, { props: radioProps, state })
          return [resolved.root, semantic?.root, style]
        }}
      >
        {({ pressed }) => {
          const state: RadioStyleState = {
            checked: isChecked,
            disabled: effectiveDisabled,
            pressed,
          }
          const resolved = getRadioStyles(token, radioProps, state, buttonLayout)
          const semantic = resolveStyles(styles, { props: radioProps, state })
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
            <View style={semantic?.label}>{children}</View>
          ) : null

          if (resolvedVariant === 'button') return label

          return (
            <>
              {labelPosition === 'left' ? label : null}
              <View style={[resolved.indicator, semantic?.indicator]}>
                {shape === 'dot' ? (
                  isChecked ? (
                    <View style={resolved.dot} />
                  ) : null
                ) : isChecked ? (
                  <Icon
                    name="CheckOutlined"
                    size={resolved.checkSize}
                    color={resolved.checkColor}
                  />
                ) : null}
              </View>
              {labelPosition === 'right' ? label : null}
            </>
          )
        }}
      </InteractionPressable>
    )
  },
)

Radio.displayName = 'Radio'
