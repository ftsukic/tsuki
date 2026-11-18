/**
 * @title Button v2
 * @description Canary examples for the v2 Button contract.
 */
import Basic from './examples/basic'
import CustomText from './examples/custom-text'
import NestedText from './examples/nested-text'
import TextCascade from './examples/text-cascade'
import SemanticClasses from './examples/semantic-classes'

export default function ButtonOverview() {
  return (
    <>
      <Basic />
      <SemanticClasses />
      <TextCascade />
      <NestedText />
      <CustomText />
    </>
  )
}
