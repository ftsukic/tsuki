import React from 'react'

/**
 * @title Avatar.Group
 * @description Group 会叠放直接子级 Avatar，maxCount 超出后显示可点击的 +N 头像。
 */
import { Avatar } from '@ftsukic/tsuki'
import { View } from 'react-native'

export default function Example() {
  return (
    <View style={{ gap: 20 }}>
      <Avatar.Group size="small">
        <Avatar style={{ backgroundColor: '#1989FA' }}>A</Avatar>
        <Avatar style={{ backgroundColor: '#07C160' }}>B</Avatar>
        <Avatar style={{ backgroundColor: '#FF976A' }}>C</Avatar>
      </Avatar.Group>
      <Avatar.Group size="large" shape="circle" maxCount={2}>
        <Avatar style={{ backgroundColor: '#1989FA' }}>A</Avatar>
        <Avatar style={{ backgroundColor: '#07C160' }}>B</Avatar>
        <Avatar style={{ backgroundColor: '#FF976A' }}>C</Avatar>
      </Avatar.Group>
      <Avatar.Group
        shape="square"
        borderRadius={12}
        maxCount={3}
        onOverflowPress={() => undefined}
        styles={{
          overflowAvatar: { backgroundColor: '#1989FA' },
          overflowText: { color: '#FFFFFF' },
        }}
      >
        <Avatar style={{ backgroundColor: '#1989FA' }}>A</Avatar>
        <Avatar style={{ backgroundColor: '#07C160' }}>B</Avatar>
        <Avatar style={{ backgroundColor: '#FF976A' }}>C</Avatar>
        <Avatar style={{ backgroundColor: '#7232DD' }}>D</Avatar>
      </Avatar.Group>
      <Avatar.Group maxCount={2} showOverflow={false}>
        <Avatar style={{ backgroundColor: '#1989FA' }}>A</Avatar>
        <Avatar style={{ backgroundColor: '#07C160' }}>B</Avatar>
        <Avatar style={{ backgroundColor: '#FF976A' }}>C</Avatar>
        <Avatar style={{ backgroundColor: '#7232DD' }}>D</Avatar>
      </Avatar.Group>
    </View>
  )
}
