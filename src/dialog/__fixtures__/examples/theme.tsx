import React from 'react'

import { Button, ConfigProvider, Dialog } from '@ftsukic/tsuki'
import { useState } from 'react'
import { View } from 'react-native'

/**
 * @title 主题定制
 * @description 通过 Dialog token 和 semantic styles 定制面板、按钮和正文样式。
 */
export default function DialogThemeExample() {
  const [show, setShow] = useState(false)

  return (
    <ConfigProvider
      theme={{
        components: {
          Dialog: {
            backgroundColor: '#172b3a',
            borderRadius: 20,
            buttonDisabledOpacity: 0.7,
            buttonFontSize: 18,
            buttonPressedOverlayColor: '#52c41a',
            messageColor: '#d9f7be',
            titleColor: '#ffffff',
          },
        },
      }}
    >
      <View style={{ gap: 12 }}>
        <Button onPress={() => setShow(true)}>显示主题 Dialog</Button>
        <Dialog
          show={show}
          title="主题 Dialog"
          message="组件 token 和 semantic styles 可以同时使用。"
          showCancelButton
          cancelButtonDisabled
          onShowChange={setShow}
          styles={{
            message: { fontWeight: '600' },
            root: { borderWidth: 1, borderColor: '#52c41a' },
          }}
        />
      </View>
    </ConfigProvider>
  )
}
