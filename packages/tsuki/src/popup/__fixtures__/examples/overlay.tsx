/**
 * @title Overlay Press
 * @description Reports mask presses and requests a close without duplicating visibility callbacks.
 */
import { useState } from 'react'
import { Button, Popup, Text } from '@ftsukic/tsuki'

export default function PopupOverlay() {
  const [visible, setVisible] = useState(false)
  const [pressCount, setPressCount] = useState(0)

  return (
    <>
      <Button onPress={() => setVisible(true)}>Open dismissible Popup</Button>
      <Text>Mask presses: {pressCount}</Text>
      <Popup
        closeOnPressOverlay
        visible={visible}
        onVisibleChange={setVisible}
        onPressOverlay={() => setPressCount((count) => count + 1)}
      >
        <Text className="p-5">Tap the mask or use Android Back.</Text>
      </Popup>
    </>
  )
}
