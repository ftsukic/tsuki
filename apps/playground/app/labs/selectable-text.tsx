import { SelectableText } from '@ftsukic/tsuki-native'
import { useState } from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'

const styles = StyleSheet.create({
  screen: { padding: 24, paddingTop: 64, gap: 12 },
  nativeText: { width: 240, height: 80 },
})

export default function App() {
  const [expanded, setExpanded] = useState(false)
  const [mounted, setMounted] = useState(true)
  const [sizes, setSizes] = useState<string[]>([])

  const text = expanded ? 'Updated native text\nSecond native line' : 'Initial native text'

  return (
    <View style={styles.screen}>
      <Text accessibilityRole="header">Fabric smoke test</Text>
      <Button title="Update text" onPress={() => setExpanded((value) => !value)} />
      <Button
        title={mounted ? 'Unmount text' : 'Mount text'}
        onPress={() => {
          setSizes([])
          setMounted((value) => !value)
        }}
      />
      {mounted && (
        <SelectableText
          style={styles.nativeText}
          text={text}
          onContentSizeChange={({ nativeEvent: { width, height } }) => {
            const size = width.toFixed(1) + ' x ' + height.toFixed(1) + ' dp'
            setSizes((previous) => [...previous, size])
          }}
        />
      )}
      <Text>Text length: {text.length}</Text>
      <Text>{mounted ? 'Mounted' : 'Unmounted'}</Text>
      <Text>Events: {sizes.length}</Text>
      <Text>{sizes.join(' → ')}</Text>
    </View>
  )
}
