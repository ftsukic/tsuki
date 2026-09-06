/**
 * @title Notify · theme
 * @description 展示 Notify 的真实公开 API 和可交互状态。
 */
import { Notify, UIProvider } from '@ftsukic/react-native-ui'

export default function Example() {
  return (
    <UIProvider>
      <Notify visible type="success" message="保存成功" />
    </UIProvider>
  )
}
