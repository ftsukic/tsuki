/**
 * @title ActionSheet · custom
 * @description 展示 ActionSheet 的真实公开 API 和可交互状态。
 */
import { ActionSheet, Button, UIProvider } from '@ftsukic/react-native-ui'

export default function Example() {
  return (
    <UIProvider>
      <Button text="选择操作" type="primary" />
      <ActionSheet
        visible
        title="操作"
        description="选择一个操作"
        actions={[{ name: '编辑' }, { name: '删除', color: '#ee0a24' }]}
        cancelText="取消"
      />
    </UIProvider>
  )
}
