/**
 * @title Round buttons
 * @description Use the alternate footer with pill shaped outlined and solid actions.
 */
import { Button, Dialog } from '@ftsukic/tsuki'
import { useState } from 'react'

export default function DialogRoundButtonExample() {
  const [visible, setVisible] = useState(false)
  return (
    <>
      <Button onPress={() => setVisible(true)}>Show round buttons</Button>
      <Dialog
        visible={visible}
        onVisibleChange={setVisible}
        title="Discard draft?"
        message="You can continue editing or discard the draft."
        showCancelButton
        theme="round-button"
      />
    </>
  )
}
