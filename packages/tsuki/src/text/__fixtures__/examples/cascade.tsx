/**
 * @title Cascade
 * @description Demonstrates Text cascade.
 */
import { Text, TextClassContext } from '../../index'

export default function Cascade() {
  return (
    <TextClassContext.Provider value="text-tsuki-primary">
      <Text>Inherited</Text>
    </TextClassContext.Provider>
  )
}
