import { FixtureOverview } from '../../fixture-overview'
import ToastBasicExample from './examples/basic'
import ToastControlledExample from './examples/controlled'
import ToastInteractionsExample from './examples/interactions'
import ToastMultipleExample from './examples/multiple'
import ToastPositionsExample from './examples/positions'
import ToastThemeExample from './examples/theme'

/**
 * @title Toast overview
 * @description Toast 通过 selector 汇总类型、位置、交互和主题示例，每次只挂载一个提示案例。
 */
export default function ToastOverview() {
  return (
    <FixtureOverview
      mode="single"
      examples={[
        {
          Component: ToastBasicExample,
          description: 'Toast 支持 text、loading、success 和 fail 四种原生提示类型。',
          id: 'basic',
          title: '基础类型',
        },
        {
          Component: ToastControlledExample,
          description: '直接使用 Toast，通过 show 和 onShowChange 管理显示状态。',
          id: 'controlled',
          title: '受控组件',
        },
        {
          Component: ToastInteractionsExample,
          description:
            'duration 为 0 时保持显示，可通过实例 close、closeToast、overlay 和 forbidClick 控制生命周期与触摸行为。',
          id: 'interactions',
          title: '持续显示与交互',
        },
        {
          Component: ToastMultipleExample,
          description: '默认新提示会更新当前实例，开启 allowMultipleToast 后可以同时展示多个提示。',
          id: 'multiple',
          title: '单例与多实例',
        },
        {
          Component: ToastPositionsExample,
          description: '使用 position 将提示放在顶部、中间或底部。',
          id: 'positions',
          title: '位置',
        },
        {
          Component: ToastThemeExample,
          description: '通过 ConfigProvider 的 Toast token 和 semantic styles 定制外观。',
          id: 'theme',
          title: '主题定制',
        },
      ]}
    />
  )
}
