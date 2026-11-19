/**
 * @title Composition
 * @description Nested cards composed with text and layout primitives.
 */

import { Card, Space, Text } from '@ftsukic/tsuki'

export default function Composition() {
  return (
    <Card>
      <Card.Body>
        <Space direction="vertical" gap={8}>
          <Text>Outer content</Text>
          <Card bordered padding={8}>
            <Text>Nested content</Text>
          </Card>
        </Space>
      </Card.Body>
    </Card>
  )
}
