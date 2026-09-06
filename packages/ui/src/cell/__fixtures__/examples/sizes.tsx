/**
 * @title Cell · sizes
 * @description 展示 Cell 的真实公开 API 和可交互状态。
 */
import { Cell } from '@ftsukic/react-native-ui'

export default function Example() {
  return (
    <Cell.Group title="设置">
      <Cell title="账户" value="已登录" isLink />
      <Cell title="通知" value="已开启" />
      <Cell.Swipe title="左滑操作" right={[{ text: '删除', backgroundColor: '#ee0a24' }]} />
    </Cell.Group>
  )
}
