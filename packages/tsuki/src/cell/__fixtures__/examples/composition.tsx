/**
 * @title Composition
 * @description Composes a row with a custom title and accessory.
 */

import { Cell, Icon, Text } from '@ftsukic/tsuki'

export default function Composition() {
  return (
    <Cell
      title={<Text className="font-bold">Storage</Text>}
      trailing={<Icon name="InfoCircleOutlined" />}
    />
  )
}
