import { TimePicker } from '@ftsukic/tsuki'

/** @title 步进 @description minuteStep 会减少真实的 canonical options，而不是只改变显示。 */
export default function Step() {
  return <TimePicker defaultValue={['12', '30']} minuteStep={5} title="五分钟步进" />
}
