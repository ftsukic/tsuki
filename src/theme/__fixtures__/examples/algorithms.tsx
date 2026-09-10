import React from 'react'

import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import {
  Button,
  Cell,
  ConfigProvider,
  darkAlgorithm,
  defaultAlgorithm,
  Input as TextInput,
} from '../../..'

/**
 * @title Theme algorithms and overrides
 * @description Switch between light and dark algorithms and inspect a component token override.
 */
export default function ThemeAlgorithmsFixture() {
  const [dark, setDark] = useState(false)

  return (
    <ConfigProvider
      theme={{
        algorithm: dark ? darkAlgorithm : defaultAlgorithm,
        token: { colorPrimary: dark ? '#69b1ff' : '#1989fa' },
        components: { Button: { borderRadius: 16 } },
      }}
    >
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
      </View>
    </ConfigProvider>
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
  title: {
    color: '#333333',
    fontSize: 18,
    fontWeight: '600',
  },
})
