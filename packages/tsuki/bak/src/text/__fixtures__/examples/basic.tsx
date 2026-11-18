import { View } from 'react-native'
import { Text } from '@ftsukic/tsuki'

/**
 * @title 基础文本
 * @description 默认文本自动使用当前主题的 colorText，显式 style 可以覆盖主题颜色。
 */
export default function TextBasicExample() {
  return (
    <View style={{ gap: 8 }}>
      <Text>默认文本</Text>
      <Text style={{ color: '#1989FA' }}>覆盖颜色</Text>
    </View>
  )
}
