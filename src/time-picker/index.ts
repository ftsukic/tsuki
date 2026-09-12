import { TimePicker as TimePickerComponent } from './time-picker'
import { closeTimePicker, showTimePicker } from './imperative'

export const TimePicker = Object.assign(TimePickerComponent, { open: showTimePicker })

export { closeTimePicker, showTimePicker }
export type {
  TimePickerAction,
  TimePickerColumnType,
  TimePickerFilter,
  TimePickerFormatter,
  TimePickerOption,
  TimePickerOptions,
  TimePickerProps,
  TimePickerResult,
  TimePickerValue,
} from './types'
