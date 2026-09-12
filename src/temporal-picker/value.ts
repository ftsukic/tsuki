import type { PickerValue } from '../picker/types'
import type { TemporalColumnType, TemporalFields } from './types'

export const DEFAULT_TEMPORAL_FIELDS: TemporalFields = {
  year: 1970,
  month: 1,
  day: 1,
  hour: 0,
  minute: 0,
  second: 0,
}

export function dateToTemporalFields(date: Date): TemporalFields {
  return {
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    month: date.getMonth() + 1,
    second: date.getSeconds(),
    year: date.getFullYear(),
  }
}

export function temporalFieldsToDate(fields: TemporalFields): Date {
  return new Date(
    fields.year,
    fields.month - 1,
    fields.day,
    fields.hour,
    fields.minute,
    fields.second,
  )
}

function getNumericValue(value: PickerValue | undefined, fallback: number): number {
  const number = Number(value)
  return Number.isFinite(number) ? Math.trunc(number) : fallback
}

export function pickerValuesToTemporalFields(
  values: readonly PickerValue[],
  columnsType: readonly TemporalColumnType[],
  base: TemporalFields = DEFAULT_TEMPORAL_FIELDS,
): TemporalFields {
  const fields = { ...base }
  columnsType.forEach((type, index) => {
    fields[type] = getNumericValue(values[index], fields[type])
  })
  return fields
}

export function temporalFieldsToPickerValues(
  fields: TemporalFields,
  columnsType: readonly TemporalColumnType[],
): number[] {
  return columnsType.map((type) => fields[type])
}

export function temporalFieldsKey(fields: TemporalFields): string {
  return [fields.year, fields.month, fields.day, fields.hour, fields.minute, fields.second].join(
    ':',
  )
}
