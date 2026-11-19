/**
 * @title Composition
 */
import { Cell } from '../..'
import { Button } from '../../../button'
import { Text } from '../../../text'

export default function Composition() {
  return <Cell title={<Text className="font-bold">Storage</Text>} value={<Button>Manage</Button>} />
}
