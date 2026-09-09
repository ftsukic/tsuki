import { FixtureOverview } from '../../fixture-overview'
import PopupBasicExample from './examples/basic'
import PopupAnimationPlayground from './examples/animation-playground'
import PopupInteractionsExample from './examples/interactions'
import PopupLifecycleExample from './examples/lifecycle'
import PopupPositionsExample from './examples/positions'
import PopupSafeAreaExample from './examples/safe-area'
import PopupThemeExample from './examples/theme'

/**
 * @title Popup overview
 * @description Popup 通过 selector 汇总位置、交互、生命周期和主题示例，每次只挂载一个弹层。
 */
export default function PopupOverview() {
  return (
    <FixtureOverview
      mode="single"
      examples={[
        {
          Component: PopupAnimationPlayground,
          description: '验证打开、关闭、快速反转、销毁和 Android 返回键等动画生命周期。',
          id: 'animation-playground',
          title: '动画 Playground',
        },
        {
          Component: PopupBasicExample,
          description: 'Popup 通过 visible 受控显示，默认居中并使用 PortalHost 承载浮层。',
          id: 'basic',
          title: '基础用法',
        },
        {
          Component: PopupInteractionsExample,
          description:
            'overlay 控制遮罩，onPressOverlay 监听点击，closeOnPressOverlay 发出受控关闭请求。',
          id: 'interactions',
          title: '遮罩交互',
        },
        {
          Component: PopupLifecycleExample,
          description: 'lazyRender 延迟首次渲染，destroyOnClosed 在关闭动画完成后卸载内容。',
          id: 'lifecycle',
          title: '生命周期与销毁',
        },
        {
          Component: PopupPositionsExample,
          description:
            'position 支持 center、top、bottom、left 和 right，round 会按位置裁剪对应圆角。',
          id: 'positions',
          title: '五种位置',
        },
        {
          Component: PopupSafeAreaExample,
          description: 'bottom Popup 将宿主提供的 safe-area inset 加入面板底部内边距。',
          id: 'safe-area',
          title: '底部安全区',
        },
        {
          Component: PopupThemeExample,
          description: '通过 Popup token 和 semantic styles 定制面板、遮罩和宿主层。',
          id: 'theme',
          title: '主题定制',
        },
      ]}
    />
  )
}
