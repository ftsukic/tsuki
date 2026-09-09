import React from 'react'

/**
 * @title 尺寸和形状
 * @description Avatar 支持 small、medium、large 和自定义数值尺寸，并可切换圆形、方形或自定义圆角。
 */
import { Avatar, Icon } from '@ftsukic/tsuki'
import { Text, View } from 'react-native'

export default function Example() {
  return (
    <View style={{ gap: 20 }}>
      <View style={{ gap: 8 }}>
        <Text>Preset · 24 / 32 / 40</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar size="small" style={{ backgroundColor: '#1989FA' }}>
            A
          </Avatar>
          <Avatar style={{ backgroundColor: '#07C160' }}>A</Avatar>
          <Avatar size="large" style={{ backgroundColor: '#FF976A' }}>
            A
          </Avatar>
          <Avatar size="small" style={{ backgroundColor: '#7232DD' }}>
            USER
          </Avatar>
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Text>Numeric · 16 / 24 / 32 / 56</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar size={16} style={{ backgroundColor: '#1989FA' }}>
            A
          </Avatar>
          <Avatar size={24} style={{ backgroundColor: '#07C160' }}>
            A
          </Avatar>
          <Avatar size={32} style={{ backgroundColor: '#FF976A' }}>
            AB
          </Avatar>
          <Avatar size={56} borderRadius={12} style={{ backgroundColor: '#7232DD' }}>
            LONG
          </Avatar>
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Text>Icon · follows Avatar size</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar
            size="small"
            icon={<Icon name="UserOutlined" />}
            style={{ backgroundColor: '#1989FA' }}
          />
          <Avatar icon={<Icon name="UserOutlined" />} style={{ backgroundColor: '#07C160' }} />
          <Avatar
            size="large"
            icon={<Icon name="UserOutlined" />}
            style={{ backgroundColor: '#FF976A' }}
          />
          <Avatar
            size={56}
            icon={<Icon name="UserOutlined" />}
            style={{ backgroundColor: '#7232DD' }}
          />
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar size={56} shape="square" style={{ backgroundColor: '#1677FF' }}>
          <Icon name="UserOutlined" color="#ffffff" />
        </Avatar>
        <Avatar size={56} borderRadius={12} style={{ backgroundColor: '#1677FF' }}>
          R
        </Avatar>
      </View>
    </View>
  )
}
