import { Skeleton } from '@ftsukic/tsuki'

/**
 * @title Row widths
 * @description Apply individual widths to paragraph rows.
 */
export default function SkeletonWidthsExample() {
  return <Skeleton title row={3} rowWidth={['100%', '80%', '60%']} />
}
