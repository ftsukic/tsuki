import { useState } from 'react'
import { Button, Text } from '@ftsukic/tsuki'
import type { ReactNode } from 'react'
import { View } from 'react-native'

function ConfirmationLabelFrame({ children }: { children: ReactNode }) {
  return <View>{children}</View>
}

function ConfirmationLabel({ saved }: { saved: boolean }) {
  return (
    <ConfirmationLabelFrame>
      <View>
        <Text className="font-semibold">{saved ? '订单已保存' : '确认并保存订单'}</Text>
      </View>
    </ConfirmationLabelFrame>
  )
}

/**
 * @title 嵌套 Tsuki Text
 * @description 多层业务组件中的 Tsuki Text 继承 Button 内容样式，并可通过局部 Text props 覆盖字号。
 */
export default function ButtonNestedTextExample() {
  const [saved, setSaved] = useState(false)

  return (
    <View style={{ gap: 12 }}>
      <Button type="primary" size="large" onPress={() => setSaved((value) => !value)}>
        <ConfirmationLabel saved={saved} />
      </Button>
      <Button variant="filled" size="small">
        <Text size="large" weight="700">
          局部强调字号
        </Text>
      </Button>
    </View>
  )
}
