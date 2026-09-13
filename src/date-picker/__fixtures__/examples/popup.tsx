import { useState } from 'react'
import { Cell, DatePicker, Popup } from '@ftsukic/tsuki'
import type { DatePickerValue } from '@ftsukic/tsuki'

/** @title Popup 集成 @description 通过 Cell 打开受控底部 DatePicker，确认后提交值。 */
export default function DatePickerPopupExample() {
  const [value, setValue] = useState<DatePickerValue>(['2026', '09', '13'])
  const [draft, setDraft] = useState(value)
  const [visible, setVisible] = useState(false)
  const handleOpen = () => {
    setDraft(value)
    setVisible(true)
  }
  const handleCancel = () => setVisible(false)
  return (
    <>
      <Cell title="日期" value={value.join('-')} isLink onPress={handleOpen} />
      <Popup
        visible={visible}
        position="bottom"
        round
        closeOnPressOverlay
        safeAreaInsetBottom
        destroyOnClosed
        onRequestClose={handleCancel}
      >
        <DatePicker
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
