/**
 * @title Sections
 * @description A Card with all three optional sections.
 */

import { Card, Text } from '@ftsukic/tsuki'

export default function Sections() {
  return (
    <Card bordered>
      <Card.Header>
        <Text>Header</Text>
      </Card.Header>
      <Card.Body>
        <Text>Body</Text>
      </Card.Body>
      <Card.Footer>
        <Text>Footer</Text>
      </Card.Footer>
    </Card>
  )
}
