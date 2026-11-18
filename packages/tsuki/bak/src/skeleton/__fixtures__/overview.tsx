import { FixtureOverview } from '../../fixture-overview'
import SkeletonAvatarExample from './examples/avatar'
import SkeletonBasicExample from './examples/basic'
import SkeletonLoadingExample from './examples/loading'
import SkeletonRoundExample from './examples/round'
import SkeletonThemeExample from './examples/theme'
import SkeletonWidthsExample from './examples/widths'

/**
 * @title Skeleton overview
 * @description Skeleton covers content shapes, avatars, loading state, themes and animation.
 */
export default function SkeletonOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: SkeletonBasicExample,
          description: 'Basic title and rows.',
          id: 'basic',
          title: 'Basic',
        },
        {
          Component: SkeletonAvatarExample,
          description: 'Avatar and content layout.',
          id: 'avatar',
          title: 'Avatar',
        },
        {
          Component: SkeletonWidthsExample,
          description: 'Per-row widths.',
          id: 'widths',
          title: 'Row widths',
        },
        {
          Component: SkeletonRoundExample,
          description: 'Round rows and square avatar.',
          id: 'round',
          title: 'Round',
        },
        {
          Component: SkeletonLoadingExample,
          description: 'Toggle loading and content.',
          id: 'loading',
          title: 'Loading',
        },
        {
          Component: SkeletonThemeExample,
          description: 'Token overrides and motion.',
          id: 'theme',
          title: 'Theme',
        },
      ]}
    />
  )
}
