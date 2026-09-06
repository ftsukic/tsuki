/**
 * @title Dialog · theme
 * @description 展示 Dialog 的真实公开 API 和可交互状态。
 */
import { Dialog, UIProvider } from '@ftsukic/react-native-ui'

export default function Example() {
  return (
    <UIProvider>
      <Dialog visible title="提示" message="这是一条可操作的提示。" showCancelButton />
    </UIProvider>
  )
}
