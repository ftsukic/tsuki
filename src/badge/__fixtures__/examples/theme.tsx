import React from 'react'

/**
 * @title 主题和语义样式
 * @description Badge 支持组件 token、语义样式和 standalone 固定圆形定制。
 */
import { Avatar, Badge, ConfigProvider } from '@ftsukic/tsuki'
import { View } from 'react-native'

export default function Example() {
  return (
    <ConfigProvider theme={{ components: { Badge: { color: '#7232DD' } } }}>
      <View style={{ gap: 24 }}>
        <Badge
          content={8}
          styles={({ state }) => ({
            root: { opacity: state.visible ? 1 : 0.5 },
            indicator: { transform: [{ translateX: 3 }, { translateY: -3 }] },
            text: { fontWeight: '700' },
          })}
        >
          <Avatar style={{ backgroundColor: '#1989FA' }}>A</Avatar>
        </Badge>
        <Badge
          content={10}
          styles={{
            indicator: {
              width: 28,
              minWidth: 28,
              height: 28,
              minHeight: 28,
              paddingHorizontal: 0,
              borderRadius: 14,
            },
            text: {
              fontSize: 16,
              lineHeight: 28,
            },
          }}
        />
      </View>
    </ConfigProvider>
  )
}
