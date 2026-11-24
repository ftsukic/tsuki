/**
 * @title Custom content and footer
 * @description Replace the message with composed content and provide a custom footer.
 */
import { Button, Dialog, Text } from '@ftsukic/tsuki'
import { useState } from 'react'

const paragraphs = [
  'Custom body content can include any React Native view. This example uses a long, scrollable body while the title and footer stay in place.',
  'Use the same layout for supporting details, review notes, or other content that needs more room than a short message.',
  'The body is hosted in a native ScrollView. It can contain text, buttons, forms, images, and other composed views.',
  'A fixed footer keeps the primary action available while readers move through longer content on a small screen.',
  'Custom body content can include any React Native view. This example uses a long, scrollable body while the title and footer stay in place.',
  'Use the same layout for supporting details, review notes, or other content that needs more room than a short message.',
  'The body is hosted in a native ScrollView. It can contain text, buttons, forms, images, and other composed views.',
  'More details continue below. This final paragraph lets you scroll the Dialog body while the title and footer stay fixed.',
]

export default function DialogCustomContentExample() {
  const [visible, setVisible] = useState(false)
  return (
    <>
      <Button onPress={() => setVisible(true)}>Show custom content</Button>
      <Dialog
        visible={visible}
        onVisibleChange={setVisible}
        title="Account details"
        message="This text is replaced by children."
        footer={<Button onPress={() => setVisible(false)}>Done</Button>}
      >
        {paragraphs.map((paragraph, index) => (
          <Text key={`${paragraph}-${index}`} style={{ marginBottom: 12 }}>
            {paragraph}
          </Text>
        ))}
      </Dialog>
    </>
  )
}
