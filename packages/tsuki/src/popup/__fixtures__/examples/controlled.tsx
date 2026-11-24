/**
 * @title Controlled Visibility
 * @description Keeps visibility in the owner and receives mask or Back close requests.
 */
import { useState } from 'react'
import { Button, Popup, Text } from '@ftsukic/tsuki'

export default function ControlledPopup() {
  const [visible, setVisible] = useState(false)
  const [requestCount, setRequestCount] = useState(0)

  return (
    <>
      <Button onPress={() => setVisible(true)}>Show controlled Popup</Button>
      <Text>Close requests: {requestCount}</Text>
      <Popup
        visible={visible}
        onVisibleChange={(nextVisible) => {
          setRequestCount((count) => count + 1)
          setVisible(nextVisible)
        }}
      >
        <Text className="p-5">The parent owns visible.</Text>
      </Popup>
    </>
  )
}
