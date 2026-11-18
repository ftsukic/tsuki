import { FixtureOverview } from '../../fixture-overview'
import SwitchBeforeChangeExample from './examples/before-change'
import SwitchColorsExample from './examples/colors'
import SwitchStatesExample from './examples/states'
import SwitchSemanticExample from './examples/semantic'

/**
 * @title Switch overview
 * @description Switch supports tokenized sizes, custom values, loading and async confirmation.
 */
export default function SwitchOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: SwitchSemanticExample,
          description: 'Customize track and indicator geometry, state colors and loading layout.',
          id: 'semantic',
          title: 'Semantic styles',
        },
        {
          Component: SwitchStatesExample,
          description: 'Compare the default, checked, disabled, loading and named size states.',
          id: 'states',
          title: 'States and sizes',
        },
        {
          Component: SwitchColorsExample,
          description: 'Customize active and inactive track colors for a themed control.',
          id: 'colors',
          title: 'Custom colors',
        },
        {
          Component: SwitchBeforeChangeExample,
          description: 'Confirm an asynchronous state transition before committing the value.',
          id: 'before-change',
          title: 'Async beforeChange',
        },
      ]}
    />
  )
}
