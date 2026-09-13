import { useState } from 'react'
import { Cell } from '../../../cell'
import { DatePicker } from '../../../date-picker'
import { Popup } from '../../../popup'
import { TimePicker } from '../../../time-picker'
import { PickerGroup } from '../../index'

type DateValue = readonly string[]
type TimeValue = readonly string[]

const formatDateTime = (date: DateValue, time: TimeValue) =>
  `${date[0]}-${date[1]}-${date[2]} ${time[0]}:${time[1]}`

/** @title Next Step @description Cell 打开底部 Popup；nextStepText 让第一个 tab 先进入下一步。 */
export default function NextStep() {
  const initialDate: DateValue = ['2026', '09', '13']
  const initialTime: TimeValue = ['10', '30']
  const [committedDate, setCommittedDate] = useState<DateValue>(initialDate)
  const [committedTime, setCommittedTime] = useState<TimeValue>(initialTime)
  const [draftDate, setDraftDate] = useState<DateValue>(initialDate)
  const [draftTime, setDraftTime] = useState<TimeValue>(initialTime)
  const [visible, setVisible] = useState(false)
  const handleOpen = () => {
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
          nextStepText="下一步"
          onConfirm={() => {
            setCommittedDate(draftDate)
            setCommittedTime(draftTime)
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
