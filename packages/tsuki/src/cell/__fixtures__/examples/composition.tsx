import { useState } from 'react'
import { View } from 'react-native'
import { Avatar, Cell, Checkbox, Text } from '../../..'

/**
 * @title Composition and alignment
 * @description Compare top/center alignment and compose selection, avatars, and multiline content.
 */
export default function CellCompositionFixture() {
  const [checked, setChecked] = useState(false)
  return (
    <Cell.Group border={false}>
      <Cell
        leading={<Avatar size={40}>群</Avatar>}
        title="项目讨论群"
        description={
          <View>
            <Text type="secondary">项目地址与多行搜索摘要</Text>
            <Text type="secondary">共 3 条相关聊天记录</Text>
          </View>
        }
        trailing="星期五"
      />
      <Cell
        center
        leading={<Avatar size={40}>安</Avatar>}
        title="万小安"
        description="信息部 / 浙江万安科技股份有限公司"
        showArrow
      />
      <Cell
        center
        leading={
          <View
            pointerEvents="none"
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
          >
            <Checkbox checked={checked} accessible={false} style={{ alignSelf: 'center' }} />
            <Avatar size={40}>安</Avatar>
          </View>
        }
        title="万小安"
        description="选择人员"
        accessibilityRole="checkbox"
        accessibilityLabel="选择万小安"
        accessibilityState={{ checked }}
        onPress={() => setChecked((current) => !current)}
        trailing={checked ? '已选择' : '未选择'}
        styles={{
          leading: { marginRight: 12 },
          trailingContainer: { maxWidth: 80, flexShrink: 1 },
        }}
      />
    </Cell.Group>
  )
}
