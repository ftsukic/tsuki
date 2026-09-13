import { Picker } from '@ftsukic/tsuki'

const emptyOption = [{ text: '暂无数据', value: '__empty__' as const, disabled: true }]

/**
 * @title 暂无数据
 * @description 空数据作为 disabled option 展示，不把空状态文案做成 Picker 基础 API。
 */
export default function PickerEmptyExample() {
  return <Picker columns={emptyOption} title="选择城市" />
}
