/**
 * @title Classes and native styles
 * @description Combine a root utility, semantic class slots, and React Native styles.
 */
import { Button } from '@ftsukic/tsuki'

export default function ButtonSemanticClassesExample() {
  return (
    <Button
      className="bg-tsuki-primary rounded-tsuki-button"
      classNames={{ root: 'px-4', content: 'font-semibold' }}
      style={{ minWidth: 96 }}
      styles={{ content: { letterSpacing: 0.2 } }}
      onPress={() => {}}
    >
      Save
    </Button>
  )
}
