import React from 'react'

import { Avatar, Badge, Icon } from '@ftsukic/tsuki'
import { Text, View } from 'react-native'

/**
 * @title 组件预览
 */
export default function AvatarOverview() {
  return (
    <View style={{ gap: 12 }}>
      <View style={{ gap: 12 }}>
        <Text style={{ color: '#68788d', fontSize: 14 }}>基础头像</Text>
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: 12 }}>
          <Avatar style={{ backgroundColor: '#1989FA' }}>A</Avatar>
          <Avatar size="large" style={{ backgroundColor: '#07C160' }}>
            User
          </Avatar>
          <Avatar shape="square" style={{ backgroundColor: '#FF976A' }}>
            <Icon name="UserOutlined" color="#ffffff" size={20} />
          </Avatar>
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <Text style={{ color: '#68788d', fontSize: 14 }}>分组和角标</Text>
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: 24 }}>
          <Avatar.Group maxCount={3} onOverflowPress={() => undefined}>
            <Avatar style={{ backgroundColor: '#1989FA' }}>A</Avatar>
            <Avatar style={{ backgroundColor: '#07C160' }}>B</Avatar>
            <Avatar style={{ backgroundColor: '#FF976A' }}>C</Avatar>
            <Avatar style={{ backgroundColor: '#7232DD' }}>D</Avatar>
          </Avatar.Group>
          <Badge count={5}>
            <Avatar style={{ backgroundColor: '#1989FA' }}>A</Avatar>
          </Badge>
        </View>
      </View>
    </View>
  )
}
