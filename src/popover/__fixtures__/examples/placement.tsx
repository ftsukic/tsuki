import { Button, Popover } from '@ftsukic/tsuki'
import { StyleSheet, View } from 'react-native'
import type { PopoverPlacement } from '@ftsukic/tsuki'

const placements: readonly PopoverPlacement[] = ['top', 'bottom', 'left', 'right', 'auto']

/**
 * @title Popover placement
 * @description Try the five supported placement values.
 */
export default function PopoverPlacementFixture() {
  return (
    <View style={styles.container}>
      {placements.map((placement) => (
        <Popover key={placement} placement={placement} actions={[{ text: placement }]}>
          <Button size="small" variant="outline">
            {placement}
          </Button>
        </Popover>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
})
