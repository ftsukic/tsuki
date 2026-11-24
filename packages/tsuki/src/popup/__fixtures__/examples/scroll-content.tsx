/**
 * @title Long Scrollable Content
 * @description Constrains a tall Popup to the host and keeps its content vertically scrollable.
 */
import { useState } from 'react'
import { Button, Popup, Text } from '@ftsukic/tsuki'

export default function PopupScrollContent() {
  const [visible, setVisible] = useState(false)

  return (
    <>
      <Button onPress={() => setVisible(true)}>Open long content</Button>
      <Popup position="bottom" scrollable visible={visible} onVisibleChange={setVisible}>
        {Array.from({ length: 28 }, (_, index) => (
          <Text key={index} className="border-b border-tsuki-border px-5 py-3">
            Scroll row {index + 1}
          </Text>
        ))}
      </Popup>
    </>
  )
}
