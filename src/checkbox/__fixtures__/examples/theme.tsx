import { Checkbox, ConfigProvider, Text, useToken } from '@ftsukic/tsuki'
import { View } from 'react-native'

function CustomLabelExample() {
  const { token } = useToken()

  return (
    <Checkbox
      styles={({ state }) => ({
        label: {
          backgroundColor: state.checked ? token.colorPrimaryBg : token.colorFillTertiary,
          borderRadius: token.borderRadiusSM,
          paddingHorizontal: token.paddingXS,
          paddingVertical: token.paddingXXS,
        },
      })}
    >
      <View style={{ gap: token.paddingXXS }}>
        <Text>自定义标签</Text>
        <Text type="secondary">点击切换标签区域的背景</Text>
      </View>
    </Checkbox>
  )
}

/**
 * @title 主题定制
 * @description 通过 token 定制主题，并通过 styles.label 调整自定义标签区域。
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
      <CustomLabelExample />
    </ConfigProvider>
  )
}
