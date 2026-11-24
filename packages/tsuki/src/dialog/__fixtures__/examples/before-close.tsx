/**
 * @title Async beforeClose
 * @description Hold the Dialog open while an asynchronous validation is running.
 */
import { Button, Dialog } from '@ftsukic/tsuki'
import { useState } from 'react'

export default function DialogBeforeCloseExample() {
  const [visible, setVisible] = useState(false)
  return (
    <>
      <Button onPress={() => setVisible(true)}>Validate before closing</Button>
      <Dialog
        visible={visible}
        onVisibleChange={setVisible}
        title="Submit changes?"
        message="The confirm button shows a loading state for half a second."
        beforeClose={async (action) => {
          if (action === 'confirm') await new Promise((resolve) => setTimeout(resolve, 500))
          return true
        }}
      />
    </>
  )
}
