import { FixtureOverview } from '../../fixture-overview'
import SurfaceMixedExample from './examples/mixed'

/**
 * @title Surface overview
 * @description Surface provides a rounded visual container for related mobile content.
 */
export default function SurfaceOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: SurfaceMixedExample,
          description: '展示 Surface 内并列组合 CellGroup 和 Mobile Grid。',
          id: 'mixed',
          title: 'Surface Mixed',
        },
      ]}
      fullBleedExamples
    />
  )
}
