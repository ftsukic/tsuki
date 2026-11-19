/**
 * @title Leading
 * @description Places an icon before the title and an amount after it.
 */

import { Cell, Icon } from '@ftsukic/tsuki'

export default function Leading() {
  return <Cell leading={<Icon name="InfoCircleOutlined" />} title="Storage" trailing="2 GB" />
}
