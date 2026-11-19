/**
 * @title Input semantic styles
 * @description Style the root and TextInput slots independently with utility classes and native styles.
 */

import { Input } from '@ftsukic/tsuki'

export default function InputSemanticClassesExample() {
  return (
    <Input
      accessibilityLabel="Search"
      className="border-tsuki-primary"
      classNames={{ input: 'text-tsuki-foreground placeholder:text-tsuki-muted' }}
      placeholder="Search items"
      style={{ maxWidth: 360 }}
      styles={{ input: { letterSpacing: 0.1 } }}
    />
  )
}
