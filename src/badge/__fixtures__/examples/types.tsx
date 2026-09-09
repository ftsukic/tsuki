import React from 'react'

/**
 * @title 数字、红点和溢出
 * @description count 支持数字和自定义节点，数字超过 overflowCount 时显示封顶值。
 */
import { Avatar, Badge } from '@ftsukic/tsuki'
import { Text, View } from 'react-native'

export default function Example() {
  const avatar = <Avatar style={{ backgroundColor: '#1989FA' }}>A</Avatar>

  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <Badge count={1}>{avatar}</Badge>
        <Badge count={9}>{avatar}</Badge>
        <Badge count={10}>{avatar}</Badge>
        <Badge count={99}>{avatar}</Badge>
        <Badge count={100} overflowCount={99}>
          {avatar}
        </Badge>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <Badge dot>{avatar}</Badge>
        <Badge size="small" count={9}>
          {avatar}
        </Badge>
        <Badge count={10} />
        <Badge count={99} />
        <Badge count={<Text style={{ color: '#ffffff' }}>!</Text>}>{avatar}</Badge>
      </View>
    </View>
  )
}
