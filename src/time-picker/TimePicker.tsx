import { forwardRef, useMemo } from 'react'
import type { View } from 'react-native'
import { Picker } from '../picker'
import { createTimePickerColumns } from './columns'
import type { PickerOption, PickerValue } from '../picker/types'
import type { TimePickerProps, TimePickerOption, TimePickerValue } from './types'

export const TimePicker = forwardRef<View, TimePickerProps>(function TimePicker(
  {
    columnsType,
    minHour = 0,
    maxHour = 23,
    minMinute = 0,
    maxMinute = 59,
    minSecond = 0,
    maxSecond = 59,
    filter,
    formatter,
    value,
    defaultValue,
    onChange,
    onConfirm,
    ...pickerProps
  },
  ref,
) {
  const columns = useMemo(
    () =>
      createTimePickerColumns({
        columnsType,
        filter,
        formatter,
        maxHour,
        maxMinute,
        maxSecond,
        minHour,
        minMinute,
        minSecond,
      }),
    [columnsType, filter, formatter, maxHour, maxMinute, maxSecond, minHour, minMinute, minSecond],
  )

  const typedHandleChange = (values: readonly PickerValue[], options: readonly PickerOption[]) => {
    onChange?.(values as TimePickerValue, options as readonly TimePickerOption[])
  }

  const typedHandleConfirm = (values: readonly PickerValue[], options: readonly PickerOption[]) => {
    onConfirm?.(values as TimePickerValue, options as readonly TimePickerOption[])
  }

  return (
    <Picker
      {...pickerProps}
      columns={columns}
      defaultValue={defaultValue}
      onChange={typedHandleChange}
      onConfirm={typedHandleConfirm}
      ref={ref}
      value={value}
    />
  )
})

TimePicker.displayName = 'TimePicker'
