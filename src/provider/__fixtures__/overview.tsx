import { FixtureOverview } from '../../fixture-overview'
import ProviderBasicExample from './examples/basic'
import ProviderGestureExample from './examples/gesture'
import ProviderSafeAreaExample from './examples/safe-area'

/**
 * @title Provider overview
 * @description Provider 汇总应用级主题和 Portal 上下文入口示例。
 */
export default function ProviderOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: ProviderBasicExample,
          description: 'Wrap the application once to provide shared theme and portal context.',
          id: 'basic',
          title: 'Application entry',
        },
        {
          Component: ProviderGestureExample,
          description: 'Enable the shared GestureHandlerRootView for gesture-enabled content.',
          id: 'gesture',
          title: 'Optional gesture root',
        },
        {
          Component: ProviderSafeAreaExample,
          description: 'Enable the shared SafeAreaProvider for inset-aware content.',
          id: 'safe-area',
          title: 'Optional safe-area root',
        },
      ]}
    />
  )
}
