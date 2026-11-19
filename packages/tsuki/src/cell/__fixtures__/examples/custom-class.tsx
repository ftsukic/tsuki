/**
 * @title Custom Class
 * @description Overrides the title utilities and root padding.
 */

import { Cell } from '@ftsukic/tsuki'

export default function CustomClass() {
  return (
    <Cell
      title="Custom slots"
      description="Native style overrides the root class."
      className="px-8"
      classNames={{ title: 'font-bold text-tsuki-primary' }}
      style={{ paddingHorizontal: 12 }}
    />
  )
}
