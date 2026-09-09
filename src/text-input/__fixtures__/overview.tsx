import { FixtureOverview } from '../../fixture-overview'
import TextInputBasicExample from './examples/basic'

/**
 * @title TextInput overview
 * @description TextInput 展示受控文本、可清除文本域和字数限制反馈。
 */
export default function TextInputOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: TextInputBasicExample,
          description: 'Try controlled text input, clearable textarea and word-limit feedback.',
          id: 'basic',
          title: 'TextInput states',
        },
      ]}
    />
  )
}
