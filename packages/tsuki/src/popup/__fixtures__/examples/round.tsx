/**
 * @title Rounded Bottom Panel
 * @description Applies the Popup radius token to a bottom sheet.
 */
import { useState } from 'react'
import { Button, Popup, Text } from '@ftsukic/tsuki'

export default function RoundedPopup() {
  const [visible, setVisible] = useState(false)

  return (
    <>
      <Button onPress={() => setVisible(true)}>Open rounded Popup</Button>
      <Popup position="bottom" round visible={visible} onVisibleChange={setVisible}>
        <Text className="p-5">Rounded Popup</Text>
      </Popup>
    </>
  )
}
