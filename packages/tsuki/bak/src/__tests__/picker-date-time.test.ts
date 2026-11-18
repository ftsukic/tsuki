import { describe, expect, it } from '@jest/globals'
import { createDateTimeColumns } from '../picker/date-time/columns'
import type { PickerColumnContext } from '../picker/types'
import {
  clampDateTimeFields,
  fieldsToDate,
  getDaysInMonth,
  normalizeDateTimeFields,
} from '../picker/date-time/value'

describe('picker date-time helpers', () => {
  it('calculates month lengths and leap years', () => {
    expect(getDaysInMonth(2026, 2)).toBe(28)
    expect(getDaysInMonth(2028, 2)).toBe(29)
    expect(getDaysInMonth(2100, 2)).toBe(28)
  })

  it('normalizes calendar and clock fields without Date overflow', () => {
    expect(normalizeDateTimeFields({ year: 2026, month: 2, day: 31 })).toMatchObject({
      day: 28,
      month: 2,
      year: 2026,
    })
    expect(normalizeDateTimeFields({ year: 2028, month: 2, day: 31 })).toMatchObject({
      day: 29,
      month: 2,
      year: 2028,
    })
    expect(normalizeDateTimeFields({ hour: 24, minute: -1, second: 61 })).toMatchObject({
      hour: 23,
      minute: 0,
      second: 59,
    })
  })

  it('clamps normalized fields to complete timestamp boundaries', () => {
    const minDate = new Date(2026, 1, 10, 10, 20, 5)
    const maxDate = new Date(2026, 1, 20, 12, 30, 15)

    expect(
      fieldsToDate(clampDateTimeFields({ year: 2026, month: 2, day: 1 }, minDate, maxDate)),
    ).toEqual(minDate)
    expect(
      fieldsToDate(
        clampDateTimeFields(
          { year: 2026, month: 2, day: 20, hour: 12, minute: 30, second: 30 },
          minDate,
          maxDate,
        ),
      ),
    ).toEqual(maxDate)
  })

  it('resolves dynamic day options from the selected year and month', () => {
    const columns = createDateTimeColumns({ columnsType: ['year', 'month', 'day'] })
    const context: PickerColumnContext = {
      indexes: [],
      selectedIndexes: [],
      selectedOptions: [],
      selectedValues: [2028, 2],
      values: [2028, 2],
    }
    const daySource = columns[2]

    expect(typeof daySource).toBe('function')
    expect(typeof daySource === 'function' ? daySource(context) : []).toHaveLength(29)
  })
})
