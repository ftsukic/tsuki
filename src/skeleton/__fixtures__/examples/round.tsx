import { Skeleton } from '@ftsukic/tsuki'

/**
 * @title Round and square avatar
 * @description Round paragraph shapes are independent from avatarShape.
 */
export default function SkeletonRoundExample() {
  return <Skeleton avatar avatarShape="square" round title row={2} />
}
