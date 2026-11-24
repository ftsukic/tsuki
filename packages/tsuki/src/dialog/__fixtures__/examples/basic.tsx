/**
 * @title Basic message
 * @description Open a simple Dialog and resolve the default confirm action.
 */
import { Button, Dialog } from '@ftsukic/tsuki'
import { useState } from 'react'

export default function DialogBasicExample() {
  const [visible, setVisible] = useState(false)
  return (
    <>
      <Button onPress={() => setVisible(true)}>Show message</Button>
      <Dialog
        visible={visible}
        onVisibleChange={setVisible}
        title="Notice"
        message="Changes saved."
      />
    </>
  )
}
