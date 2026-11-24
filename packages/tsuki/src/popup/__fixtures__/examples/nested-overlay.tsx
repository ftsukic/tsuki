/**
 * @title Nested Overlays
 * @description Opens Dialog and Portal entries above a visible Popup in the same Root.
 */
import { useState } from 'react'
import { Button, Dialog, Popup, Portal, Surface, Text } from '@ftsukic/tsuki'

export default function PopupNestedOverlay() {
  const [popupVisible, setPopupVisible] = useState(false)
  const [dialogVisible, setDialogVisible] = useState(false)
  const [portalVisible, setPortalVisible] = useState(false)

  return (
    <>
      <Button onPress={() => setPopupVisible(true)}>Open Popup</Button>
      <Popup position="bottom" visible={popupVisible} onVisibleChange={setPopupVisible}>
        <Surface className="m-4 gap-3 p-4">
          <Text>All entries share the current Root Host.</Text>
          <Button onPress={() => setDialogVisible(true)}>Open Dialog</Button>
          <Button onPress={() => setPortalVisible((value) => !value)}>
            {portalVisible ? 'Remove Portal' : 'Show Portal'}
          </Button>
        </Surface>
      </Popup>
      <Dialog
        visible={dialogVisible}
        onVisibleChange={setDialogVisible}
        title="Nested Dialog"
        message="Dialog is above the Popup."
      />
      {portalVisible ? (
        <Portal>
          <Surface className="absolute left-4 right-4 top-16 p-4">
            <Text>Portal layer above the Popup.</Text>
          </Surface>
        </Portal>
      ) : null}
    </>
  )
}
