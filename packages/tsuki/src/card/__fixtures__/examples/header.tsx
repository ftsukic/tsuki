/**
 * @title Header
 * @description A custom heading with an icon.
 */
import { Card } from '../..'
import { Icon } from '../../../icon'
import { Space } from '../../../space'
import { Text } from '../../../text'

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
