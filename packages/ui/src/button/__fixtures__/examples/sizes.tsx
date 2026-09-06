/**
 * @title Button · sizes
 * @description 展示 Button 的真实公开 API 和可交互状态。
 */
import { Button } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function Example() {
  return (
    <View style={{ gap: 12 }}>
      <Button text="主要按钮" type="primary" />
      <Button text="危险按钮" type="default" danger />
      <Button text="加载中" type="primary" loading />
    </View>
  )
}
