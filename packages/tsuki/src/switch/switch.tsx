import { forwardRef, useCallback, useLayoutEffect, useRef, useState } from 'react'
import { useMotionValue } from '../motion/useMotionValue'
import { STATE_PRESET, LAYOUT_PRESET } from '../motion/presets'
import { Pressable } from '../pressable'
import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
import { getSwitchStyles, resolveSwitchSize } from './style'
import { getSwitchToken } from './token'
import type { SwitchProps, SwitchStyleState } from './types'
import { SwitchTrack } from './switch-track'

type SwitchRef = React.ComponentRef<typeof Pressable>

function SwitchComponent<ActiveValueT = boolean, InactiveValueT = boolean>(
  {
    value,
    defaultValue,
    loading = false,
    disabled = false,
    size,
    activeColor,
    inactiveColor,
    activeValue = true as ActiveValueT,
    inactiveValue = false as InactiveValueT,
    onPress,
    onChange,
    beforeChange,
    style,
    styles,
    ...pressableProps
  }: SwitchProps<ActiveValueT, InactiveValueT>,
  ref: React.ForwardedRef<SwitchRef>,
) {
  const token = useComponentToken('Switch', getSwitchToken)
  const resolvedSize = resolveSwitchSize(size)
  const isControlled = value !== undefined
  const [uncontrolledValue, setUncontrolledValue] = useState<ActiveValueT | InactiveValueT>(
    defaultValue !== undefined ? defaultValue : inactiveValue,
  )
  const currentValue = isControlled ? (value as ActiveValueT | InactiveValueT) : uncontrolledValue
  const active = Object.is(currentValue, activeValue)
  const beforeChangeRequestRef = useRef(0)
  const latest = useRef({ active, currentValue, disabled, loading, isControlled, onChange })
  latest.current = { active, currentValue, disabled, loading, isControlled, onChange }

  useLayoutEffect(() => {
    // A value that changes away and back must still invalidate the old confirmation.
    beforeChangeRequestRef.current += 1
    return () => {
      beforeChangeRequestRef.current += 1
    }
  }, [currentValue, activeValue, inactiveValue, disabled, loading, isControlled])
  const translateProgress = useMotionValue(active ? 1 : 0, STATE_PRESET, active ? 1 : 0)
  const trackProgress = useMotionValue(
    active ? 1 : 0,
    { ...LAYOUT_PRESET, duration: token.animationDuration },
    active ? 1 : 0,
  )
  const handlePress = useCallback(() => {
    if (disabled || loading) return

    const requestId = ++beforeChangeRequestRef.current
    onPress?.()
    if (requestId !== beforeChangeRequestRef.current) return
    const sourceValue = latest.current.currentValue
    const nextValue = latest.current.active ? inactiveValue : activeValue
    const commit = (allowed: boolean) => {
      const current = latest.current
      if (
        allowed === false ||
        requestId !== beforeChangeRequestRef.current ||
        current.disabled ||
        current.loading ||
        !Object.is(current.currentValue, sourceValue)
      )
        return
      if (!current.isControlled) setUncontrolledValue(nextValue)
      current.onChange?.(nextValue)
    }

    if (!beforeChange) {
      commit(true)
      return
    }

    const result = beforeChange(nextValue)
    if (typeof result === 'boolean') {
      commit(result)
      return
    }

    void result.then(commit, () => undefined)
  }, [activeValue, beforeChange, disabled, inactiveValue, loading, onPress])

  const switchProps = {
    ...pressableProps,
    value,
    defaultValue,
    loading,
    disabled,
    size,
    activeColor,
    inactiveColor,
    activeValue,
    inactiveValue,
    onPress,
    onChange,
    beforeChange,
    style,
    styles,
  }
  const resolve = ({ hovered, pressed }: { hovered?: boolean; pressed: boolean }) => {
    const state: SwitchStyleState = {
      active,
      disabled,
      hovered: Boolean(hovered),
      loading,
      pressed,
      size: resolvedSize,
    }
    return {
      resolved: getSwitchStyles(token, resolvedSize, state, activeColor, inactiveColor),
      semantic: resolveStyles(styles, { props: switchProps, state }),
    }
  }

  return (
    <Pressable
      ref={ref}
      {...pressableProps}
      accessibilityRole="switch"
      accessibilityState={{
        ...pressableProps.accessibilityState,
        busy: loading,
        checked: active,
        disabled: disabled || loading,
      }}
      disabled={disabled || loading}
      onPress={handlePress}
      pressStyle="opacity"
      pressedOpacity={token.pressedOpacity}
      style={(state) => {
        const { resolved, semantic } = resolve(state)
        return [resolved.root, semantic?.root, style]
      }}
    >
      {(state) => {
        const { resolved, semantic } = resolve(state)
        return (
          <SwitchTrack
            active={active}
            loading={loading}
            token={token}
            activeColor={activeColor}
            inactiveColor={inactiveColor}
            resolved={resolved}
            semantic={semantic}
            translateProgress={translateProgress}
            trackProgress={trackProgress}
          />
        )
      }}
    </Pressable>
  )
}

const SwitchBase = forwardRef(SwitchComponent)

SwitchBase.displayName = 'Switch'

export const Switch = SwitchBase as <ActiveValueT = boolean, InactiveValueT = boolean>(
  props: SwitchProps<ActiveValueT, InactiveValueT> & React.RefAttributes<SwitchRef>,
) => React.ReactElement | null
