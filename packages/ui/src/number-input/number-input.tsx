import { formatDecimal, formatNumber } from '../helpers'
import { usePersistFn, useUpdateEffect } from '../hooks'
import type { TextInputInstance } from '../text-input/interface'
import { TextInput } from '../text-input/text-input'
import type { NumberInputProps } from './interface'
import isNil from 'lodash/isNil'
import isUndefined from 'lodash/isUndefined'
import { forwardRef, memo, useCallback, useRef, useState } from 'react'
import {
  Platform,
  type TextInputEndEditingEventData,
  type NativeSyntheticEvent,
} from 'react-native'

const stringify = (value?: number | null) => `${!isNil(value) ? value : ''}`

export const NumberInput = forwardRef<TextInputInstance, NumberInputProps>(
  (
    {
      type = 'number',
      min = Number.MIN_SAFE_INTEGER,
      max = Number.MAX_SAFE_INTEGER,
      parser,
      formatter,
      limitDecimals = -1,
      validateTrigger = 'onEndEditing',
      value,
      defaultValue,
      onChange,
      onEndEditing,
      keyboardType,
      ...props
    },
    ref,
  ) => {
    const initial =
      formatter?.(stringify(!isUndefined(value) ? value : defaultValue)) ??
      stringify(!isUndefined(value) ? value : defaultValue)
    const [local, setLocal] = useState(initial)
    const last = useRef<number | null | undefined>(!isUndefined(value) ? value : defaultValue)
    const onChangePersist = usePersistFn(onChange ?? (() => undefined))
    const onEndPersist = usePersistFn(onEndEditing ?? (() => undefined))
    const parserPersist = usePersistFn(parser ?? ((text) => Number(text)))
    const formatterPersist = usePersistFn(formatter ?? ((text) => text))
    useUpdateEffect(() => {
      if (value !== last.current) {
        last.current = value
        setLocal(formatterPersist(stringify(value)))
      }
    }, [value, formatterPersist])
    const trigger = useCallback(
      (text: string, validate: boolean, end: boolean) => {
        let input = text === '.' ? '0.' : text
        if (min >= 0) input = input.replace(/-/g, '')
        input = formatNumber(input, type === 'number', true)
        let normalized = formatDecimal(input, limitDecimals)
        if (validate && normalized) {
          const num = Number(normalized)
          if (num > max) normalized = `${max}`
          if (num < min) normalized = `${min}`
        }
        if (end && normalized === '-') normalized = ''
        setLocal(formatterPersist(normalized))
        if (!normalized) {
          if (last.current !== null) onChangePersist(null)
          last.current = null
          return null
        }
        if (end) {
          const parsed = parserPersist(normalized)
          setLocal(formatterPersist(stringify(parsed)))
          if (parsed !== last.current) {
            onChangePersist(parsed)
            last.current = parsed
          }
          return parsed
        }
        const parsed = Number(normalized)
        if (parsed !== last.current && normalized !== '-') {
          onChangePersist(parsed)
          last.current = parsed
        }
        return parsed
      },
      [formatterPersist, limitDecimals, max, min, onChangePersist, parserPersist, type],
    )
    const onChangeText = useCallback(
      (text: string) => {
        trigger(text, validateTrigger === 'onChangeText', false)
      },
      [trigger, validateTrigger],
    )
    const onEnd = useCallback(
      (event: NativeSyntheticEvent<TextInputEndEditingEventData>) => {
        const parsed = trigger(event.nativeEvent.text, validateTrigger === 'onEndEditing', true)
        event.nativeEvent.text = parsed === null ? '' : stringify(parsed)
        onEndPersist(event)
      },
      [onEndPersist, trigger, validateTrigger],
    )
    return (
      <TextInput
        {...props}
        ref={ref}
        keyboardType={
          keyboardType ?? (Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'decimal-pad')
        }
        value={local}
        type="text"
        onChangeText={onChangeText}
        onEndEditing={onEnd}
      />
    )
  },
)

NumberInput.displayName = 'NumberInput'

export default memo(NumberInput)
