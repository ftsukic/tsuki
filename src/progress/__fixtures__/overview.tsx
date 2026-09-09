import { FixtureOverview } from '../../fixture-overview'
import ProgressBasicExample from './examples/basic'
import ProgressCircleExample from './examples/circle'
import ProgressCircleAnimationExample from './examples/circle-animation'
import ProgressCustomTextExample from './examples/custom-text'
import ProgressDynamicExample from './examples/dynamic'
import ProgressLineWithoutPivotExample from './examples/line-without-pivot'
import ProgressLineVariantsExample from './examples/line-variants'
import ProgressThemeExample from './examples/theme'

/**
 * @title Progress overview
 * @description Progress supports tokenized line and circle indicators with animated updates.
 */
export default function ProgressOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: ProgressBasicExample,
          description: 'Render the default line progress with a percentage pivot.',
          id: 'basic',
          title: 'Default line',
        },
        {
          Component: ProgressLineWithoutPivotExample,
          description: 'Render line progress without the percentage pivot.',
          id: 'line-without-pivot',
          title: 'Line without pivot',
        },
        {
          Component: ProgressLineVariantsExample,
          description: 'Compare 50%, 100%, custom colors, and round or square line caps.',
          id: 'line-variants',
          title: 'Line variants',
        },
        {
          Component: ProgressCircleExample,
          description: 'Render circles with the default and custom sizes and stroke widths.',
          id: 'circle',
          title: 'Circle',
        },
        {
          Component: ProgressCircleAnimationExample,
          description: 'Animate the circle percentage while changing it with buttons.',
          id: 'circle-animation',
          title: 'Circle animation',
        },
        {
          Component: ProgressCustomTextExample,
          description: 'Replace the default percentage label with custom text.',
          id: 'custom-text',
          title: 'Custom text',
        },
        {
          Component: ProgressDynamicExample,
          description: 'Increase or decrease the current percentage with a Button group.',
          id: 'dynamic',
          title: 'Dynamic progress',
        },
        {
          Component: ProgressThemeExample,
          description: 'Override Progress component tokens through ConfigProvider.',
          id: 'theme',
          title: 'Theme tokens',
        },
      ]}
    />
  )
}
