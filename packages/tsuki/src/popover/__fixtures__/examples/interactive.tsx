/**
 * @title Interactive content
 * @description Keeps menu actions interactive while the outside hit-test area closes the Popover.
 */
import { Button, Popover } from '@ftsukic/tsuki'
import { Text, View } from 'react-native'
import { useState } from 'react'

export default function InteractivePopover() {
  const [message, setMessage] = useState('Choose an action')

  return (
    <View style={{ gap: 8 }}>
      <Text>{message}</Text>
      <Popover
        content={
          <View style={{ gap: 8 }}>
            <Button onPress={() => setMessage('First action selected')}>First action</Button>
            <Button onPress={() => setMessage('Second action selected')} variant="outlined">
              Second action
            </Button>
          </View>
        }
        placement="bottom-start"
      >
        <Text>Open actions</Text>
      </Popover>
    </View>
  )
}
