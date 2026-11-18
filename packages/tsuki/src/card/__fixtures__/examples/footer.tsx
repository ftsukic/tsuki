/**
 * @title Footer
 * @description An action placed in the footer.
 */
import { useState } from 'react'
import { Card } from '../..'
import { Button } from '../../../button'
import { Text } from '../../../text'

export default function Footer() {
  const [saved, setSaved] = useState(false)

  return (
    <Card>
      <Card.Body>
        <Text>{saved ? 'Changes saved' : 'Unsaved changes'}</Text>
      </Card.Body>
      <Card.Footer>
        <Button onPress={() => setSaved(true)}>Save</Button>
      </Card.Footer>
    </Card>
  )
}
