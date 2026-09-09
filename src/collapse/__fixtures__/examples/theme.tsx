import { Collapse, CollapseItem, ConfigProvider, Text } from '@ftsukic/tsuki'

/**
 * @title Collapse theme
 * @description Customize Collapse dimensions, colors and animation timing through tokens.
 */
export default function CollapseThemeExample() {
  return (
    <ConfigProvider
      theme={{
        components: {
          Collapse: {
            activeColor: '#e6f4ff',
            animationDuration: 220,
            headerHeight: 52,
          },
        },
      }}
    >
      <Collapse defaultValue="theme">
        <CollapseItem name="theme" title="主题化标题">
          <Text>Collapse 的尺寸、颜色和动画时长都来自 token。</Text>
        </CollapseItem>
      </Collapse>
    </ConfigProvider>
  )
}
