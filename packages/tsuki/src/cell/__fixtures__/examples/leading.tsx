/**
 * @title Leading
 */
import { Cell } from '../..'
import { Icon } from '../../../icon'

export default function Leading() {
  return <Cell leading={<Icon name="InfoCircleOutlined" />} title="Storage" trailing="2 GB" />
}
