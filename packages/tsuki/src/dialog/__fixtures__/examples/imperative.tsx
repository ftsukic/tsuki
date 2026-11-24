/**
 * @title Imperative service
 * @description Bind a DialogService to this TsukiProvider before using its Promise API.
 */
import { Button, DialogServiceBridge, createDialogService, useDialog } from '@ftsukic/tsuki'

const dialogService = createDialogService()

export default function DialogImperativeExample() {
  const dialog = useDialog()
  return (
    <>
      <DialogServiceBridge service={dialogService} />
      <Button
        onPress={() => {
          void dialog.alert({ title: 'Saved', message: 'Opened directly with useDialog().' })
        }}
      >
        Show with useDialog
      </Button>
      <Button
        variant="outlined"
        onPress={() => {
          void dialogService.alert({ title: 'Saved', message: 'Your changes are ready.' })
        }}
      >
        Show with service
      </Button>
    </>
  )
}
