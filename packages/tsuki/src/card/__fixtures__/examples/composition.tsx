/**
 * @title Composition
 * @description Nested cards composed with text and layout primitives.
 */
import { Card } from '../..'
import { Space } from '../../../space'
import { Text } from '../../../text'

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
