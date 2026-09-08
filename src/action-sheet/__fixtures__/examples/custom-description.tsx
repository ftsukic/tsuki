import { useState } from 'react'
import { ActionSheet, Button } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Custom ActionSheet content
 * @description Use ReactNode values for action names and descriptions.
 */
export default function ActionSheetCustomDescriptionFixture() {
  const [visible, setVisible] = useState(false)

  return (
    <View style={styles.container}>
      <Button onPress={() => setVisible(true)}>选择账号</Button>
      <ActionSheet
        visible={visible}
        actions={[
          {
            name: <Text style={styles.account}>工作账号</Text>,
            description: <Text style={styles.description}>workspace@example.com</Text>,
          },
          {
            name: <Text style={styles.account}>个人账号</Text>,
            description: <Text style={styles.description}>personal@example.com</Text>,
          },
        ]}
        onClose={() => setVisible(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  account: {
    color: '#101828',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    gap: 10,
  },
  description: {
    color: '#667085',
    fontSize: 13,
    marginTop: 3,
  },
})
