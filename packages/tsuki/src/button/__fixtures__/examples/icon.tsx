/**
 * @title Icon
 * @description Places a decorative leading icon beside the label.
 */
import { Button, Icon } from '@ftsukic/tsuki'

export default function IconExample() {
  return <Button icon={<Icon name="CheckOutlined" color="white" size={16} />}>Done</Button>
}
