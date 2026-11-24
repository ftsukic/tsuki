/**
 * @title Popup Theme
 * @description Overrides Popup background, mask, radius, and motion duration in a local scope.
 */
import { useState } from 'react'
import { Button, ConfigProvider, Popup, Text } from '@ftsukic/tsuki'

export default function PopupThemeExample() {
  const [visible, setVisible] = useState(false)

  return (
    <ConfigProvider
      theme={{
        components: {
          Popup: {
            backgroundColor: '#172554',
            overlayColor: 'rgba(15, 23, 42, 0.72)',
            borderRadius: 24,
            animationDuration: 320,
          },
        },
      }}
    >
      <Button onPress={() => setVisible(true)}>Open themed Popup</Button>
      <Popup position="bottom" round visible={visible} onVisibleChange={setVisible}>
        <Text className="p-5 text-white">Scoped Popup theme</Text>
      </Popup>
    </ConfigProvider>
  )
}
