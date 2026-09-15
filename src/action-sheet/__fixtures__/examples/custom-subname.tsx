import { useState } from 'react'
import { ActionSheet, Button } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Custom ActionSheet content
 * @description Use ReactNode values for action names and subnames.
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
            subname: <Text style={styles.subname}>workspace@example.com</Text>,
          },
          {
            name: <Text style={styles.account}>个人账号</Text>,
            subname: <Text style={styles.subname}>personal@example.com</Text>,
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
  subname: {
    color: '#667085',
    fontSize: 13,
    marginTop: 3,
  },
})
