import { useState } from 'react'
import { Cell } from '../../../cell'
import { DatePicker } from '../../../date-picker'
import { Popup } from '../../../popup'
import { PickerGroup } from '../../index'
import type { PickerGroupSelection } from '../../types'

type DateValue = readonly [string, string, string]

const formatDate = (value: DateValue) => `${value[0]}-${value[1]}-${value[2]}`

const dateValueToDate = (value: DateValue) =>
  new Date(Number(value[0]), Number(value[1]) - 1, Number(value[2]))

const compareDateValue = (a: DateValue, b: DateValue) =>
  dateValueToDate(a).getTime() - dateValueToDate(b).getTime()

const getDateValue = (results: readonly PickerGroupSelection[], index: number): DateValue => {
  const values = results[index]?.values
  if (
    values?.length !== 3 ||
    typeof values[0] !== 'string' ||
    typeof values[1] !== 'string' ||
    typeof values[2] !== 'string'
  ) {
    throw new Error('PickerGroup DatePicker result must contain year/month/day string values')
  }
  return [values[0], values[1], values[2]]
}

/** @title Date Range @description Cell 打开底部 Popup；两个日期 Picker 使用 draft 即时联动范围。 */
export default function DateRange() {
  const [committedStart, setCommittedStart] = useState<DateValue>(['2026', '09', '10'])
  const [committedEnd, setCommittedEnd] = useState<DateValue>(['2026', '09', '20'])
  const [draftStart, setDraftStart] = useState(committedStart)
  const [draftEnd, setDraftEnd] = useState(committedEnd)
  const [visible, setVisible] = useState(false)
  const handleOpen = () => {
    setDraftStart(committedStart)
    setDraftEnd(committedEnd)
    setVisible(true)
  }
  const handleCancel = () => setVisible(false)
  const handleStartChange = (next: DateValue) => {
    setDraftStart(next)
    if (compareDateValue(next, draftEnd) > 0) setDraftEnd(next)
  }
  const handleEndChange = (next: DateValue) => setDraftEnd(next)
  return (
    <>
      <Cell
        title="选择日期范围"
        value={`${formatDate(committedStart)} 至 ${formatDate(committedEnd)}`}
        isLink
        onPress={handleOpen}
      />
      <Popup
        visible={visible}
        position="bottom"
        round
        closeOnPressOverlay
        safeAreaInsetBottom
        destroyOnClosed
        onRequestClose={handleCancel}
      >
        <PickerGroup
          title="选择日期范围"
          tabs={['开始日期', '结束日期']}
          nextStepText="下一步"
          onConfirm={(results) => {
            const start = getDateValue(results, 0)
            let end = getDateValue(results, 1)
            if (compareDateValue(start, end) > 0) end = start
            setCommittedStart(start)
            setCommittedEnd(end)
            setDraftStart(start)
            setDraftEnd(end)
            setVisible(false)
          }}
          onCancel={handleCancel}
        >
          <DatePicker value={draftStart} onChange={handleStartChange} />
          <DatePicker
            value={draftEnd}
            minDate={dateValueToDate(draftStart)}
            onChange={handleEndChange}
          />
        </PickerGroup>
      </Popup>
    </>
  )
}
