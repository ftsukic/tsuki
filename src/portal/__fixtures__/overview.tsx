import PortalControlledInputExample from './examples/controlled-input'
import { FixtureOverview } from '../../fixture-overview'
import PortalBasicExample from './examples/basic'
import PortalImperativeExample from './examples/imperative'

/**
 * @title Portal overview
 * @description Portal 通过 selector 汇总组件式和命令式挂载示例，每次只挂载一个 Portal 案例。
 */
export default function PortalOverview() {
  return (
    <FixtureOverview
      mode="single"
      examples={[
        {
          Component: PortalControlledInputExample,
          description: '页面父级持有 value，验证中文输入和外部赋值、清空。',
          id: 'controlled-input',
          title: '父级受控输入',
        },
        {
          Component: PortalBasicExample,
          description: 'Portal 会将内容渲染到 PortalHost 的宿主层。',
          id: 'basic',
          title: '组件式 Portal',
        },
        {
          Component: PortalImperativeExample,
          description: '使用 PortalKey 更新或卸载由 mountPortal 创建的 entry。',
          id: 'imperative',
          title: '命令式挂载',
        },
      ]}
    />
  )
}
