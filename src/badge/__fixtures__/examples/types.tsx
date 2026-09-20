import React from 'react'

/**
 * @title 数字、红点和独立展示
 * @description content 支持数字、胶囊、显式 max、零值、红点和 standalone 展示。
 */
import { Avatar, Badge } from '@ftsukic/tsuki'
import { Text, View } from 'react-native'

export default function Example() {
  const avatar = <Avatar style={{ backgroundColor: '#1989FA' }}>A</Avatar>

  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <Badge content={1}>{avatar}</Badge>
        <Badge content={9}>{avatar}</Badge>
        <Badge content={10}>{avatar}</Badge>
        <Badge content={99}>{avatar}</Badge>
        <Badge content={100}>{avatar}</Badge>
        <Badge content={100} max={99}>
          {avatar}
        </Badge>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <Badge dot>{avatar}</Badge>
        <Badge content={0}>{avatar}</Badge>
        <Badge content={0} showZero={false}>
          {avatar}
        </Badge>
        <Badge content={<Text style={{ color: '#ffffff' }}>!</Text>}>{avatar}</Badge>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <Badge content={1} />
        <Badge content={10} />
        <Badge content={99} />
        <Badge content={100} />
        <Badge content={100} max={99} />
        <Badge dot />
      </View>
    </View>
  )
}
