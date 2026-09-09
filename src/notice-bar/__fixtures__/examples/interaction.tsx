import { useState } from 'react'
import { NoticeBar } from '../../..'
import { Text, View } from 'react-native'

/**
 * @title Interaction
 * @description Handle bar clicks and close the current notice from its default close action.
 */
export default function NoticeBarInteractionFixture() {
  const [clickCount, setClickCount] = useState(0)
  const [visible, setVisible] = useState(true)

  return (
    <View>
      {visible ? (
        <NoticeBar
          onClick={() => setClickCount((count) => count + 1)}
          onClose={() => setVisible(false)}
          text="点击通知栏主体，或点击右侧关闭图标。"
          visible={visible}
        />
      ) : null}
      <Text>{visible ? `已点击 ${clickCount} 次` : '通知已关闭'}</Text>
    </View>
  )
}
