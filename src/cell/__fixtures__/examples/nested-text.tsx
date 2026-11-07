import { Cell, Text } from '@ftsukic/tsuki'
import type { ReactNode } from 'react'
import { View } from 'react-native'

function ContactLabel({ children }: { children: ReactNode }) {
  return (
    <View>
      <View>{children}</View>
    </View>
  )
}

function ContactTitle() {
  return (
    <ContactLabel>
      <Text className="font-semibold">项目负责人</Text>
    </ContactLabel>
  )
}

function ContactValue() {
  return (
    <ContactLabel>
      <Text>林晓</Text>
    </ContactLabel>
  )
}

/**
 * @title 嵌套 Tsuki Text
 * @description 联系人列表将标题、辅助说明、值和右侧状态放在独立文本槽中，各自继承对应槽位样式。
 */
export default function CellNestedTextExample() {
  return (
    <Cell
      leading={
        <ContactLabel>
          <Text>人</Text>
        </ContactLabel>
      }
      title={<ContactTitle />}
      titleExtra={
        <ContactLabel>
          <Text type="secondary">负责人</Text>
        </ContactLabel>
      }
      description={
        <ContactLabel>
          <Text size="small">负责当前项目的排期与审批</Text>
        </ContactLabel>
      }
      value={<ContactValue />}
      valueExtra={
        <ContactLabel>
          <Text type="secondary">在线</Text>
        </ContactLabel>
      }
      trailing={
        <ContactLabel>
          <Text>今天</Text>
        </ContactLabel>
      }
    />
  )
}
