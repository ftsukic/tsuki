/**
 * @title Confirm and cancel
 * @description Provide both actions and keep the button callbacks in the business component.
 */
import { Button, Dialog } from '@ftsukic/tsuki'
import { useState } from 'react'

export default function DialogConfirmExample() {
  const [visible, setVisible] = useState(false)
  return (
    <>
      <Button onPress={() => setVisible(true)}>Delete item</Button>
      <Dialog
        visible={visible}
        onVisibleChange={setVisible}
        title="Delete item?"
        message="This action cannot be undone."
        showCancelButton
      />
    </>
  )
}
