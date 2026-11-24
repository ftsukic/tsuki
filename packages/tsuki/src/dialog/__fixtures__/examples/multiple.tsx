/**
 * @title Independent services
 * @description Separate services remain independent even when they share the same Root.
 */
import { Button, DialogServiceBridge, createDialogService } from '@ftsukic/tsuki'

const firstService = createDialogService()
const secondService = createDialogService()

export default function DialogMultipleServicesExample() {
  return (
    <>
      <DialogServiceBridge service={firstService} />
      <DialogServiceBridge service={secondService} />
      <Button onPress={() => void firstService.alert({ title: 'First service' })}>
        Open first
      </Button>
      <Button onPress={() => void secondService.confirm({ title: 'Second service' })}>
        Open second
      </Button>
    </>
  )
}
