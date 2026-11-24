/**
 * @title Basic Popup
 * @description Opens a bottom panel and closes it from an action in its content.
 */
import { useState } from 'react'
import { Button, Popup, Text } from '@ftsukic/tsuki'

export default function BasicPopup() {
  const [visible, setVisible] = useState(false)

  return (
    <>
      <Button onPress={() => setVisible(true)}>Open Popup</Button>
      <Popup position="bottom" visible={visible} onVisibleChange={setVisible}>
        <Text className="p-5">Popup content stays mounted during its exit transition.</Text>
        <Button onPress={() => setVisible(false)}>Close</Button>
      </Popup>
    </>
  )
}
