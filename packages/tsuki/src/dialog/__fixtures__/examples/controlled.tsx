/**
 * @title Controlled visibility
 * @description Keep visibility in the parent and answer close requests explicitly.
 */
import { Button, Dialog } from '@ftsukic/tsuki'
import { useState } from 'react'

export default function DialogControlledExample() {
  const [visible, setVisible] = useState(false)
  return (
    <>
      <Button onPress={() => setVisible(true)}>Open controlled Dialog</Button>
      <Dialog
        visible={visible}
        onVisibleChange={(nextVisible) => setVisible(nextVisible)}
        title="Controlled"
        message="The parent owns this state."
      />
    </>
  )
}
