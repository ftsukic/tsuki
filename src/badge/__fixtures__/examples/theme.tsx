import React from 'react'

/**
 * @title 主题和语义样式
 * @description Badge 支持组件 token 和 root、indicator、dot、text 语义样式。
 */
import { Avatar, Badge, ConfigProvider } from '@ftsukic/tsuki'

export default function Example() {
  return (
    <ConfigProvider theme={{ components: { Badge: { color: '#7232DD' } } }}>
      <Badge
        count={8}
        styles={({ state }) => ({
          root: { opacity: state.visible ? 1 : 0.5 },
          indicator: { transform: [{ translateX: 3 }, { translateY: -3 }] },
          text: { fontWeight: '700' },
        })}
      >
        <Avatar style={{ backgroundColor: '#1989FA' }}>A</Avatar>
      </Badge>
    </ConfigProvider>
  )
}
