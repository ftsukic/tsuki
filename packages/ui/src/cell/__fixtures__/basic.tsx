import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Cell, ConfigProvider, Icon } from '../..'

/**
 * @title Cell groups and interactions
 * @description Render grouped cells with labels, links, required markers and custom content.
 */
export default function CellBasicFixture() {
  const [message, setMessage] = useState('Tap a link cell')

  return (
    <ConfigProvider>
      <View style={styles.container}>
        <Cell.Group title="Account" extra="Edit" inset>
          <Cell
            icon={<Icon name="UserOutlined" size={20} />}
            title="Profile"
            label="Name and avatar"
            value="View"
            required
            isLink
            onPress={() => setMessage('Profile opened')}
          />
          <Cell title="Notifications" value="Enabled" styles={{ value: { color: '#1989fa' } }} />
          <Cell title="Disabled link" value="Unavailable" isLink disabled />
        </Cell.Group>

        <Cell.Group title="Directions" inset>
          <Cell title="Left arrow" value="Back" isLink arrowDirection="left" />
          <Cell title="Up arrow" value="Expand" isLink arrowDirection="up" />
          <Cell title="Down arrow" value="Collapse" isLink arrowDirection="down" />
        </Cell.Group>

        <Text style={styles.message}>{message}</Text>
      </View>
    </ConfigProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingVertical: 16,
  },
  message: {
    color: '#666666',
    fontSize: 14,
    paddingHorizontal: 16,
  },
})
