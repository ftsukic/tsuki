/**
 * @title Toast · interactions
 * @description 展示 Toast 的真实公开 API 和可交互状态。
 */
import { Toast, UIProvider } from '@ftsukic/react-native-ui'

export default function Example() {
  return (
    <UIProvider>
      <Toast type="success" message="操作成功" duration={0} />
    </UIProvider>
  )
}
