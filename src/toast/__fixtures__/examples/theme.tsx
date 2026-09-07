import React from 'react'

import { StyleSheet, View } from 'react-native'
import { Button, ConfigProvider, showToast } from '@ftsukic/tsuki'

/**
 * @title 主题定制
 * @description 通过 ConfigProvider 的 Toast token 和 semantic styles 定制外观。
 */
export default function ToastThemeExample() {
  return (
    <ConfigProvider
      theme={{
        components: {
          Toast: {
            backgroundColor: '#1d2733',
            borderRadius: 16,
            duration: 2600,
            textColor: '#d9f7be',
          },
        },
      }}
    >
      <View style={styles.container}>
        <Button
          onPress={() =>
            showToast({
              message: '使用 Toast token 定制',
              styles: ({ state }) => ({
                message: { fontWeight: state.show ? '700' : '400' },
                root: { borderWidth: 1, borderColor: '#52c41a' },
              }),
            })
          }
        >
          显示主题提示
        </Button>
      </View>
    </ConfigProvider>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
})
