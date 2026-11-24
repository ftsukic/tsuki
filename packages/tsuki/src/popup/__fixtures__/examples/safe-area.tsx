/**
 * @title Bottom Safe Area
 * @description Adds the current bottom inset to the panel background and touch area.
 */
import { useState } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Button, Popup, Text } from '@ftsukic/tsuki'

export default function PopupSafeArea() {
  const [visible, setVisible] = useState(false)

  return (
    <SafeAreaProvider>
      <Button onPress={() => setVisible(true)}>Open safe-area Popup</Button>
      <Popup position="bottom" safeAreaInsetBottom visible={visible} onVisibleChange={setVisible}>
        <Text className="p-5">The panel background continues through the bottom inset.</Text>
      </Popup>
    </SafeAreaProvider>
  )
}
