/**
 * @title Keyboard Avoidance
 * @description Keeps a bottom form above the keyboard and scrolls focused fields into view.
 */
import { useState } from 'react'
import { TextInput, View } from 'react-native'
import { Button, Popup, Text } from '@ftsukic/tsuki'
import type { PopupPosition } from '@ftsukic/tsuki'

export default function PopupKeyboard() {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState<PopupPosition>('bottom')

  const openAt = (nextPosition: PopupPosition) => {
    setPosition(nextPosition)
    setVisible(true)
  }

  return (
    <>
      <Button onPress={() => openAt('bottom')}>Open bottom input form</Button>
      <Button onPress={() => openAt('center')}>Open centered input form</Button>
      <Popup
        keyboardAvoiding
        position={position}
        safeAreaInsetBottom
        visible={visible}
        onVisibleChange={setVisible}
      >
        <View style={{ gap: 12, padding: 20 }}>
          <Text>Enter the details:</Text>
          <TextInput
            placeholder="Name"
            style={{ borderColor: '#d1d5db', borderRadius: 8, borderWidth: 1, padding: 12 }}
          />
          <TextInput
            keyboardType="email-address"
            placeholder="Email"
            style={{ borderColor: '#d1d5db', borderRadius: 8, borderWidth: 1, padding: 12 }}
          />
          <TextInput
            placeholder="Notes"
            style={{ borderColor: '#d1d5db', borderRadius: 8, borderWidth: 1, padding: 12 }}
          />
        </View>
      </Popup>
    </>
  )
}
