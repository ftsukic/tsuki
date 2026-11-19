/**
 * @title Theme
 * @description A local Card token override.
 */

import { Card, ConfigProvider, Text } from '@ftsukic/tsuki'

export default function Theme() {
  return (
    <ConfigProvider theme={{ components: { Card: { padding: 8, headerPadding: 4, gap: 12 } } }}>
      <Card>
        <Card.Header>
          <Text>Local heading</Text>
        </Card.Header>
        <Card.Body>
          <Text>Local content</Text>
        </Card.Body>
      </Card>
    </ConfigProvider>
  )
}
