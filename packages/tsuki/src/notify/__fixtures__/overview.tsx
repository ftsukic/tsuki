import { FixtureOverview } from '../../fixture-overview'
import NotifyControlledExample from './examples/controlled'
import NotifyInteractionsExample from './examples/interactions'
import NotifySafeAreaExample from './examples/safe-area'
import NotifyThemeExample from './examples/theme'
import NotifyTypesExample from './examples/types'

/**
 * @title Notify overview
 * @description Notify 汇总类型、受控显示、命令式交互、主题和顶部安全区示例，每次只挂载一个通知。
 */
export default function NotifyOverview() {
  return (
    <FixtureOverview
      mode="single"
      examples={[
        {
          Component: NotifyTypesExample,
          description: '通过 type 展示 primary、success、warning 和 error 四种通知颜色。',
          id: 'types',
          title: '类型',
        },
        {
          Component: NotifyControlledExample,
          description: '使用 visible 管理显示状态，并通过 ref.close 请求关闭。',
          id: 'controlled',
          title: '受控组件',
        },
        {
          Component: NotifyInteractionsExample,
          description: 'showNotify 返回的实例可以更新 message 或关闭当前单例通知。',
          id: 'interactions',
          title: '命令式交互',
        },
        {
          Component: NotifyThemeExample,
          description: '通过 Notify token 和单次样式定制通知外观。',
          id: 'theme',
          title: '主题和样式',
        },
        {
          Component: NotifySafeAreaExample,
          description: '默认将顶部安全区加入通知内边距，也可以通过 safeAreaInsetTop 关闭。',
          id: 'safe-area',
          title: '顶部安全区',
        },
      ]}
    />
  )
}
