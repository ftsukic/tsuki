import React from 'react'

import { Text, View } from 'react-native'
import Disabled from './examples/disabled'
import Group from './examples/group'
import Options from './examples/options'
import Shapes from './examples/shapes'
import Standalone from './examples/standalone'
import Styled from './examples/styled'
import Theme from './examples/theme'

/**
 * @title 组件预览
 */
export default function RadioOverview() {
  return (
    <View style={{ padding: 20, gap: 32, backgroundColor: '#ffffff' }}>
      <View style={{ gap: 16 }}>
        <Text style={{ color: '#68788d', fontSize: 14 }}>独立 Radio</Text>
        <Standalone />
      </View>
      <View style={{ gap: 16 }}>
        <Text style={{ color: '#68788d', fontSize: 14 }}>子节点分组</Text>
        <Group />
      </View>
      <View style={{ gap: 16 }}>
        <Text style={{ color: '#68788d', fontSize: 14 }}>options 分组</Text>
        <Options />
      </View>
      <View style={{ gap: 16 }}>
        <Text style={{ color: '#68788d', fontSize: 14 }}>指示器形状</Text>
        <Shapes />
      </View>
      <View style={{ gap: 16 }}>
        <Text style={{ color: '#68788d', fontSize: 14 }}>禁用状态</Text>
        <Disabled />
      </View>
      <View style={{ gap: 16 }}>
        <Text style={{ color: '#68788d', fontSize: 14 }}>自定义内容与语义样式</Text>
        <Styled />
      </View>
      <View style={{ gap: 16 }}>
        <Text style={{ color: '#68788d', fontSize: 14 }}>主题定制</Text>
        <Theme />
      </View>
    </View>
  )
}
