import { FixtureOverview } from '../../fixture-overview'
import IconBasicExample from './examples/basic'

/**
 * @title Icon overview
 * @description Icon 展示图标颜色、尺寸和可触摸图标。
 */
export default function IconOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: IconBasicExample,
          description:
            'Use Ant Design SVG definitions with native-style size, color and touch targets.',
          id: 'basic',
          title: 'Icon gallery',
        },
      ]}
    />
  )
}
