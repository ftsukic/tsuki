/**
 * @title Multiple Portals
 * @description Updates two concurrent Portal entries while keeping each entry mounted.
 */
import { useState } from 'react'
import { Button, Portal, Surface, Text } from '@ftsukic/tsuki'

export default function MultiplePortals() {
  const [revision, setRevision] = useState(0)

  return (
    <>
      <Button onPress={() => setRevision((value) => value + 1)}>Update both entries</Button>
      <Portal>
        <Surface className="mt-3" bordered>
          <Text>First entry, revision {revision}</Text>
        </Surface>
      </Portal>
      <Portal>
        <Surface className="mt-3" bordered>
          <Text>Second entry, revision {revision}</Text>
        </Surface>
      </Portal>
    </>
  )
}
