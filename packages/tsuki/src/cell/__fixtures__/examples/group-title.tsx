/**
 * @title Group Title
 * @description Adds a group title and supplementary label.
 */

import { Cell } from '@ftsukic/tsuki'

export default function GroupTitle() {
  return (
    <Cell.Group title="Preferences" extra="Optional">
      <Cell title="Notifications" />
    </Cell.Group>
  )
}
