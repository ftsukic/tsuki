import { useState } from 'react'
import { Button, Portal, Text } from '@ftsukic/tsuki'
import { View } from 'react-native'

function SavedNotice() {
  return (
    <View>
      <View>
        <Text className="font-semibold">订单保存成功</Text>
      </View>
    </View>
  )
}

/**
 * @title Portal 文本继承
 * @description Portal 内容跨越 JS 或 Teleport 宿主时，仍保留来源 Button 的 Tsuki Text 内容样式。
 */
export default function PortalTextInheritanceExample() {
  const [visible, setVisible] = useState(false)

  return (
    <View style={{ gap: 12 }}>
      <Button type="primary" onPress={() => setVisible((value) => !value)}>
        <>
          <Portal>
            {visible ? (
              <View style={{ alignSelf: 'center', backgroundColor: '#ffffff', padding: 16 }}>
                <SavedNotice />
              </View>
            ) : null}
          </Portal>
          {visible ? '关闭提示' : '保存并查看提示'}
        </>
      </Button>
    </View>
  )
}
