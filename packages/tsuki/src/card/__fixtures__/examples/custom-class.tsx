/**
 * @title Custom Class
 * @description NativeWind utilities on the root and sections.
 */

import { Card, Text } from '@ftsukic/tsuki'

export default function CustomClass() {
  return (
    <Card className="bg-violet-100 p-3 rounded-xl">
      <Card.Header className="p-2">
        <Text>Custom header</Text>
      </Card.Header>
      <Card.Body className="p-4">
        <Text>Custom body</Text>
      </Card.Body>
    </Card>
  )
}
