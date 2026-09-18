import { FixtureOverview } from '../../fixture-overview'
import DialogBasicExample from './examples/basic'
import DialogBeforeCloseExample from './examples/before-close'
import DialogConfirmExample from './examples/confirm'
import DialogControlledExample from './examples/controlled'
import DialogCustomExample from './examples/custom'
import DialogInteractionsExample from './examples/interactions'
import DialogLayoutExample from './examples/layout'
import DialogRoundExample from './examples/round'
import DialogThemeExample from './examples/theme'

/**
 * @title Dialog overview
 * @description Dialog 通过 selector 汇总各种交互和样式示例，每次只挂载一个浮层。
 */
export default function DialogOverview() {
  return (
    <FixtureOverview
      mode="single"
      examples={[
        {
          Component: DialogBasicExample,
          description: 'showDialog 默认展示一个确认按钮，Promise 在确认后 resolve。',
          id: 'basic',
          title: '基础提示',
        },
        {
          Component: DialogBeforeCloseExample,
          description:
            'beforeClose 可以执行异步检查；返回 false 时保持 Dialog 打开并清除按钮 loading。',
          id: 'before-close',
          title: '异步关闭',
        },
        {
          Component: DialogConfirmExample,
          description:
            'showConfirmDialog 增加取消按钮，确认和取消分别对应 Promise 的 resolve/reject。',
          id: 'confirm',
          title: '确认框',
        },
        {
          Component: DialogControlledExample,
          description: '直接使用 Dialog，通过 show 和 onShowChange 管理显示状态。',
          id: 'controlled',
          title: '受控组件',
        },
        {
          Component: DialogCustomExample,
          description: 'children 替换 message，footer 替换默认按钮区域，title 也支持 ReactNode。',
          id: 'custom',
          title: '自定义内容',
        },
        {
          Component: DialogInteractionsExample,
          description: 'closeOnClickOverlay 开启后可点击遮罩关闭，也可以分别禁用确认和取消按钮。',
          id: 'interactions',
          title: '遮罩与禁用',
        },
        {
          Component: DialogLayoutExample,
          description: '分别查看仅标题、仅正文和标题加正文时的默认布局与颜色层级。',
          id: 'layout',
          title: '内容布局',
        },
        {
          Component: DialogRoundExample,
          description: 'theme="round-button" 使用 Vant 风格的圆角操作按钮。',
          id: 'round',
          title: '圆角按钮',
        },
        {
          Component: DialogThemeExample,
          description: '通过 Dialog token 和 semantic styles 定制面板、按钮和正文样式。',
          id: 'theme',
          title: '主题定制',
        },
      ]}
    />
  )
}
