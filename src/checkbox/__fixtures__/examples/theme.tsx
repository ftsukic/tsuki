import { Checkbox, ConfigProvider } from '@ftsukic/tsuki'

/**
 * @title 主题定制
 * @description 通过 Checkbox component token 调整尺寸、圆角和选中颜色。
 */
export default function Example() {
  return (
    <ConfigProvider
      theme={{
        components: {
          Checkbox: {
            checkedBackground: '#07c160',
            gap: 10,
            size: 24,
          },
        },
      }}
    >
      <Checkbox.Group defaultValue={['green']}>
        <Checkbox name="green">绿色主题</Checkbox>
        <Checkbox name="another">其他选项</Checkbox>
      </Checkbox.Group>
    </ConfigProvider>
  )
}
