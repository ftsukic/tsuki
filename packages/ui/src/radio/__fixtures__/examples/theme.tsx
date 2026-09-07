import { ConfigProvider, Radio } from '@ftsukic/react-native-ui'

/**
 * @title 主题定制
 * @description 通过 ConfigProvider 的 theme.components.Radio 统一调整指示器和间距 token。
 */
export default function Example() {
  return (
    <ConfigProvider
      theme={{
        components: {
          Radio: {
            indicatorSize: 24,
            checkedColor: '#07c160',
            gap: 10,
          },
        },
      }}
    >
      <Radio.Group defaultValue="green">
        <Radio value="green">绿色主题</Radio>
        <Radio value="another">其他选项</Radio>
      </Radio.Group>
    </ConfigProvider>
  )
}
