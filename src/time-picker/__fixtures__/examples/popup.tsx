import { useState } from 'react'
import { Cell, Popup, TimePicker } from '@ftsukic/tsuki'
import type { TimePickerValue } from '@ftsukic/tsuki'

/** @title Popup 集成 @description 通过 Cell 打开受控底部 TimePicker，确认后提交值。 */
export default function TimePickerPopupExample() {
  const [value, setValue] = useState<TimePickerValue>(['12', '30'])
  const [draft, setDraft] = useState(value)
  const [visible, setVisible] = useState(false)
  const handleOpen = () => {
    setDraft(value)
    setVisible(true)
  }
  const handleCancel = () => setVisible(false)
  return (
    <>
      <Cell title="时间" value={value.join(':')} isLink onPress={handleOpen} />
      <Popup
        visible={visible}
        position="bottom"
        round
        closeOnPressOverlay
        safeAreaInsetBottom
        destroyOnClosed
        onRequestClose={handleCancel}
      >
        <TimePicker
          value={draft}
          onChange={setDraft}
          onCancel={handleCancel}
          onConfirm={(nextValue) => {
            setValue(nextValue)
            setVisible(false)
          }}
        />
      </Popup>
    </>
  )
}
