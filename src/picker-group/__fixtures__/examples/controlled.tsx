import { useState } from 'react'
import { Cell } from '../../../cell'
import { DatePicker } from '../../../date-picker'
import { Popup } from '../../../popup'
import { TimePicker } from '../../../time-picker'
import { PickerGroup } from '../../index'
import type { PickerGroupSelection } from '../../types'

type DateValue = readonly string[]
type TimeValue = readonly string[]

const formatDateTime = (date: DateValue, time: TimeValue) =>
  `${date[0]}-${date[1]}-${date[2]} ${time[0]}:${time[1]}`

const getStringValues = (
  results: readonly PickerGroupSelection[],
  index: number,
): readonly string[] =>
  (results[index]?.values ?? []).filter((value): value is string => typeof value === 'string')

/** @title Controlled active tab @description Cell 打开底部 Popup，并通过 activeTab 控制当前 tab。 */
export default function Controlled() {
  const initialDate: DateValue = ['2026', '09', '13']
  const initialTime: TimeValue = ['10', '30']
  const [committedDate, setCommittedDate] = useState<DateValue>(initialDate)
  const [committedTime, setCommittedTime] = useState<TimeValue>(initialTime)
  const [draftDate, setDraftDate] = useState<DateValue>(initialDate)
  const [draftTime, setDraftTime] = useState<TimeValue>(initialTime)
  const [activeTab, setActiveTab] = useState(0)
  const [visible, setVisible] = useState(false)
  const handleOpen = () => {
    setActiveTab(0)
    setDraftDate(committedDate)
    setDraftTime(committedTime)
    setVisible(true)
  }
  const handleCancel = () => setVisible(false)
  return (
    <>
      <Cell
        title="选择日期和时间"
        value={formatDateTime(committedDate, committedTime)}
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
          title="选择日期和时间"
          tabs={['选择日期', '选择时间']}
          activeTab={activeTab}
          onChange={setActiveTab}
          onConfirm={(results) => {
            setCommittedDate(getStringValues(results, 0))
            setCommittedTime(getStringValues(results, 1))
            setVisible(false)
          }}
          onCancel={handleCancel}
        >
          <DatePicker value={draftDate} onChange={setDraftDate} />
          <TimePicker value={draftTime} onChange={setDraftTime} />
        </PickerGroup>
      </Popup>
    </>
  )
}
