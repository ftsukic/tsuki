import React from 'react'

import { useState } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import {
  Button,
  Text,
  Cell,
  ConfigProvider,
  getButtonToken,
  useComponentToken,
  useToken,
  Input as TextInput,
} from '../../..'
import type { ThemeConfig } from '../../..'

/**
 * @title Theme algorithms and overrides
 * @description 切换明暗主题，查看当前输入配置和解析后生效的主题参数。
 */
export default function ThemeAlgorithmsFixture() {
  const [dark, setDark] = useState(false)

  const theme: ThemeConfig = {
    mode: dark ? 'dark' : 'light',
    seed: { colorPrimary: dark ? '#69b1ff' : '#1989fa' },
    token: { pressedOpacity: 0.8 },
    components: { Button: { borderRadius: 16 } },
  }

  return (
    <ConfigProvider theme={theme}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{dark ? 'Dark theme' : 'Light theme'}</Text>
          <Button size="small" onPress={() => setDark((value) => !value)}>
            Toggle
          </Button>
        </View>
        <Button type="primary" block>
          Primary button
        </Button>
        <Cell title="Theme" value={dark ? 'Dark' : 'Light'} border={false} />
        <TextInput bordered placeholder="The provider supplies tokens" />
        <Text style={styles.sectionTitle}>当前输入配置</Text>
        <Text type="secondary">
          通过 mode 切换明暗主题，其余字段来自传入 TsukiProvider 的配置。
        </Text>
        <Text selectable style={styles.code}>
          {JSON.stringify(theme, null, 2)}
        </Text>
        <ResolvedThemeParameters />
      </View>
    </ConfigProvider>
  )
}

function ResolvedThemeParameters() {
  const { token } = useToken()
  const button = useComponentToken('Button', getButtonToken)
  const parameters = {
    colorPrimary: token.colorPrimary,
    colorPrimaryBg: token.colorPrimaryBg,
    colorBgBase: token.colorBgBase,
    colorBgContainer: token.colorBgContainer,
    colorText: token.colorText,
    fontSize: token.fontSize,
    borderRadius: token.borderRadius,
    pressedOpacity: token.pressedOpacity,
    motion: token.motion,
    Button: { height: button.height, borderRadius: button.borderRadius },
  }

  return (
    <>
      <Text style={styles.sectionTitle}>解析后生效的参数</Text>
      <Text selectable style={styles.code}>
        {JSON.stringify(parameters, null, 2)}
      </Text>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontWeight: '600',
  },
  code: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
})
