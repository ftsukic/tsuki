import { useState } from 'react'
import { Cell, DateTimePicker, Popup } from '@ftsukic/tsuki'
import type { DateTimePickerValue } from '@ftsukic/tsuki'

/** @title Popup 集成 @description 通过 Cell 打开受控底部 DateTimePicker，确认后提交值。 */
export default function DateTimePickerPopupExample() {
  const [value, setValue] = useState<DateTimePickerValue>(['2026', '09', '13', '21', '30'])
  const [draft, setDraft] = useState(value)
  const [visible, setVisible] = useState(false)
  const handleOpen = () => {
    setDraft(value)
    setVisible(true)
  }
  const handleCancel = () => setVisible(false)
  return (
    <>
      <Cell title="日期时间" value={value.join(' ')} isLink onPress={handleOpen} />
      <Popup
        visible={visible}
        position="bottom"
        round
        closeOnPressOverlay
        safeAreaInsetBottom
        destroyOnClosed
        onRequestClose={handleCancel}
      >
        <DateTimePicker
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
