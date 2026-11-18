import { FixtureOverview } from '../../fixture-overview'
import PortalBasicExample from './examples/basic'

/**
 * @title Teleport Portal overview
 * @description Tsuki 的浮层组件直接使用 react-native-teleport，应用负责提供 PortalProvider。
 */
export default function PortalOverview() {
  return (
    <FixtureOverview
      mode="single"
      examples={[
        {
          Component: PortalBasicExample,
          description: '应用级 PortalProvider 提供 root 宿主，Portal 按 hostName 渲染。',
          id: 'basic',
          title: '组件式 Portal',
        },
      ]}
    />
  )
}
