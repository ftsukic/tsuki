import { FixtureOverview } from '../../fixture-overview'
import LoadingBasicExample from './examples/basic'
import LoadingSizeColorExample from './examples/size-color'
import LoadingTextExample from './examples/text'
import LoadingThemeExample from './examples/theme'
import LoadingTypeExample from './examples/type'
import LoadingVerticalExample from './examples/vertical'

/**
 * @title Loading overview
 * @description Loading supports distinct circular and spinner indicators, text, layout, and theme slots.
 */
export default function LoadingOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: LoadingBasicExample,
          description: 'Render the default circular Loading indicator.',
          id: 'basic',
          title: 'Basic',
        },
        {
          Component: LoadingTypeExample,
          description: 'Compare the circular gap ring with the radial spinner bars.',
          id: 'type',
          title: 'Type',
        },
        {
          Component: LoadingSizeColorExample,
          description: 'Customize the shared indicator size and color for either type.',
          id: 'size-color',
          title: 'Size and color',
        },
        {
          Component: LoadingTextExample,
          description: 'Place a loading message beside the indicator.',
          id: 'text',
          title: 'Text',
        },
        {
          Component: LoadingVerticalExample,
          description: 'Stack the indicator above its loading message.',
          id: 'vertical',
          title: 'Vertical',
        },
        {
          Component: LoadingThemeExample,
          description: 'Override Loading tokens and semantic slots through ConfigProvider.',
          id: 'theme',
          title: 'Theme and styles',
        },
      ]}
    />
  )
}
