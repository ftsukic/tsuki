import { Icon, NoticeBar } from '../../..'
import { Text } from 'react-native'

/**
 * @title Custom content
 * @description Use children for custom content and a static right icon.
 */
export default function NoticeBarCustomContentFixture() {
  return (
    <NoticeBar
      rightIcon={<Icon name="RightOutlined" size={16} />}
      text="这段 text 会被 children 覆盖"
    >
      <Text>children 可以组合任意 React Native 内容</Text>
    </NoticeBar>
  )
}
