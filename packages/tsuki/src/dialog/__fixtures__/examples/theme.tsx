/**
 * @title Dialog theme
 * @description Override Dialog component tokens and shared semantic colors in a local scope.
 */
import { Button, ConfigProvider, Dialog } from '@ftsukic/tsuki'
import { useState } from 'react'

export default function DialogThemeExample() {
  const [visible, setVisible] = useState(false)
  return (
    <ConfigProvider
      theme={{
        semantic: { colorPrimary: '#7c3aed' },
        components: { Dialog: { width: 300, borderRadius: 20, contentPadding: 24 } },
      }}
    >
      <Button onPress={() => setVisible(true)}>Show themed Dialog</Button>
      <Dialog
        visible={visible}
        onVisibleChange={setVisible}
        title="Themed Dialog"
        message="Theme tokens follow the nearest ConfigProvider."
        showCancelButton
      />
    </ConfigProvider>
  )
}
