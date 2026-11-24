/**
 * @title Default Portal
 * @description Mounts custom content in the current Tsuki root Host and removes it with its owner.
 */
import { useState } from 'react'
import { Button, Portal, Surface, Text } from '@ftsukic/tsuki'

export default function BasicPortal() {
  const [visible, setVisible] = useState(false)

  return (
    <>
      <Button onPress={() => setVisible((value) => !value)}>
        {visible ? 'Remove Portal content' : 'Show Portal content'}
      </Button>
      {visible ? (
        <Portal>
          <Surface className="mt-3" bordered>
            <Text>Mounted above the screen content.</Text>
          </Surface>
        </Portal>
      ) : null}
    </>
  )
}
