/**
 * @title Overlay · interactions
 * @description 展示 Overlay 的真实公开 API 和可交互状态。
 */
import { Overlay, UIProvider } from '@ftsukic/react-native-ui'

export default function Example() {
  return (
    <UIProvider>
      <Overlay visible backgroundColor="rgba(0, 0, 0, 0.45)" />
    </UIProvider>
  )
}
