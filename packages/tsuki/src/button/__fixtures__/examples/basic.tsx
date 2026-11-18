/**
 * @title Button variants
 * @description Compare solid, outlined, and ghost Button variants with three sizes.
 */
import { Button } from '@ftsukic/tsuki'
import { Text, View } from 'react-native'

export default function ButtonBasicExample() {
  return (
    <View style={{ gap: 12 }}>
      <Button onPress={() => {}}>Continue</Button>
      <Button variant="outlined" onPress={() => {}}>
        Secondary action
      </Button>
      <Button variant="ghost" size="small" onPress={() => {}}>
        Learn more
      </Button>
      <Button loading onPress={() => {}}>
        Saving
      </Button>
      <Button icon={<Text>✓</Text>} classNames={{ icon: 'mr-2' }} onPress={() => {}}>
        Completed
      </Button>
    </View>
  )
}
