/**
 * @title Host Lifecycle
 * @description Keeps the Portal entry pending while its named Host is unmounted, then restores it.
 */
import { useState } from 'react'
import { Button, Portal, PortalHost, Surface, Text } from '@ftsukic/tsuki'

export default function PortalHostLifecycle() {
  const [hostMounted, setHostMounted] = useState(true)

  return (
    <>
      <Button onPress={() => setHostMounted((mounted) => !mounted)}>
        {hostMounted ? 'Unmount Host' : 'Restore Host'}
      </Button>
      {hostMounted ? <PortalHost name="temporary-panel" /> : null}
      <Portal host="temporary-panel">
        <Surface className="m-3" bordered>
          <Text>The owner remains mounted while this Host is away.</Text>
        </Surface>
      </Portal>
    </>
  )
}
