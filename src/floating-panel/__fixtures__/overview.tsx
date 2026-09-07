import React from 'react'

import { Text, View } from 'react-native'
import type { ReactNode } from 'react'
import Basic from './examples/basic'
import Anchors from './examples/anchors'
import ContentDraggable from './examples/content-draggable'
import Magnetic from './examples/magnetic'
import Disabled from './examples/disabled'
import SafeArea from './examples/safe-area'
import Theme from './examples/theme'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ color: '#68788d', fontSize: 14 }}>{title}</Text>
      {children}
    </View>
  )
}

/**
 * @title 组件预览
 */
export default function FloatingPanelOverview() {
  return (
    <View style={{ gap: 28, padding: 20, backgroundColor: '#f7f8fa' }}>
      <Section title="基础用法">
        <Basic />
      </Section>
      <Section title="自定义锚点">
        <Anchors />
      </Section>
      <Section title="仅拖动头部">
        <ContentDraggable />
      </Section>
      <Section title="关闭磁吸">
        <Magnetic />
      </Section>
      <Section title="禁用拖动">
        <Disabled />
      </Section>
      <Section title="底部安全区">
        <SafeArea />
      </Section>
      <Section title="主题定制">
        <Theme />
      </Section>
    </View>
  )
}
