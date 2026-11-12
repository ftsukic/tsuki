import { useState } from 'react'
import { Text, View } from 'react-native'
import { ConfigProvider, NoticeBar } from '../../..'

/**
 * @title Theme and semantic styles
 * @description Override theme tokens and style the real NoticeBar regions.
 */
export default function NoticeBarThemeFixture() {
  const [clickCount, setClickCount] = useState(0)
  return (
    <ConfigProvider
      theme={{
        seed: { colorWarning: '#155EEF' },
        token: { colorWarningBg: '#EFF4FF', padding: 20 },
      }}
    >
      <View style={{ gap: 12 }}>
        <NoticeBar text="NoticeBar 的语义颜色和间距来自当前主题 token。" />
        <NoticeBar
          text="点击通知主体，或通过独立按钮关闭。"
          onClick={() => setClickCount((count) => count + 1)}
          onClose={() => {}}
          style={{ borderRadius: 8 }}
          styles={({ state }) => ({
            root: { backgroundColor: state.disabled ? '#F2F4F7' : '#E0F2FE' },
            body: { paddingVertical: 4 },
            content: { marginRight: 8 },
            text: { color: '#075985', fontWeight: '600' },
            closeAction: { marginLeft: 8 },
          })}
        />
        <Text>主体已点击 {clickCount} 次</Text>
      </View>
    </ConfigProvider>
  )
}
