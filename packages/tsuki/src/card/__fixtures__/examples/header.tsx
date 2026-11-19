/**
 * @title Header
 * @description A custom heading with an icon.
 */

import { Card, Icon, Space, Text } from '@ftsukic/tsuki'

export default function Header() {
  return (
    <Card>
      <Card.Header>
        <Space gap={8} align="center">
          <Icon name="InfoCircleOutlined" />
          <Text>Project details</Text>
        </Space>
      </Card.Header>
    </Card>
  )
}
