import { Button, Text } from '@ftsukic/tsuki'
import type { ReactNode } from 'react'
import { View } from 'react-native'

function ActionLabelFrame({ children }: { children: ReactNode }) {
  return <View>{children}</View>
}

function SaveActionLabel() {
  return (
    <ActionLabelFrame>
      <View>
        <Text className="font-semibold underline">保存本次修改</Text>
      </View>
    </ActionLabelFrame>
  )
}

/**
 * @title 继承 Button 文本样式
 * @description 多层自定义组件中的 Tsuki Text 继承 Button 内容字号与颜色，同时接受 NativeWind className。
 */
export default function TextInheritanceExample() {
  return (
    <View style={{ gap: 12 }}>
      <Text type="secondary">文本由自定义组件分层组合：</Text>
      <Button type="primary" size="large">
        <SaveActionLabel />
      </Button>
    </View>
  )
}
