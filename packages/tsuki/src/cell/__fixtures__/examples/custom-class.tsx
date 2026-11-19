/**
 * @title Custom Class
 */
import { Cell } from '../..'

export default function CustomClass() {
  return (
    <Cell
      title="Custom slots"
      description="Native style overrides the root class."
      className="px-8"
      classNames={{ title: 'font-bold text-tsuki-primary' }}
      style={{ paddingHorizontal: 12 }}
    />
  )
}
