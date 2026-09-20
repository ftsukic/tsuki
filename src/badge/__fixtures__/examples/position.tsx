import React from 'react'

/**
 * @title 四角定位和偏移
 * @description 包裹 children 时支持四个角的 position，并可通过 offset 微调位置。
 */
import { Avatar, Badge } from '@ftsukic/tsuki'
import { View } from 'react-native'

export default function Example() {
  const avatar = <Avatar style={{ backgroundColor: '#1989FA' }}>A</Avatar>

  return (
    <View style={{ gap: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
        <Badge content={1} position="top-left">
          {avatar}
        </Badge>
        <Badge content={1} position="top-right">
          {avatar}
        </Badge>
        <Badge content={1} position="bottom-left">
          {avatar}
        </Badge>
        <Badge content={1} position="bottom-right">
          {avatar}
        </Badge>
      </View>
      <Badge content={8} color="#7232DD" offset={[4, 2]}>
        {avatar}
      </Badge>
    </View>
  )
}
