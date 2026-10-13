import { Button, DropdownItem, DropdownMenu, Icon, Text } from '@ftsukic/tsuki'
import { useState } from 'react'
import { View } from 'react-native'

/**
 * @title Dropdown semantic styles
 * @description 分别设置触发器、选项图标和选中标记，并在面板打开时更新样式。
 */
export default function SemanticDropdownExample() {
  const [accent, setAccent] = useState('#722ed1')
  return (
    <View style={{ gap: 12 }}>
      <DropdownMenu activeColor={accent}>
        <DropdownItem
          title="语义区域"
          defaultValue="a"
          closeOnSelect={false}
          options={[
            {
              text: '前置图标与选中标记分别配置',
              value: 'a',
              icon: <Icon name="StarOutlined" size={18} />,
            },
            { text: '长文本会换行，面板动画使用实际布局高度。长文本会换行。', value: 'b' },
          ]}
          styles={{
            title: { fontWeight: '700' },
            arrow: { marginLeft: 12 },
            popup: {
              root: { padding: 8, borderRadius: 12 },
              list: { backgroundColor: '#fafafa' },
              listItem: { minHeight: 64 },
              listItemLabel: { color: accent },
              listItemIcon: { width: 24 },
              listItemSelectedIcon: { width: 32, marginLeft: 16 },
              mask: { backgroundColor: 'rgba(0,0,0,0.3)' },
            },
          }}
        ></DropdownItem>
        <DropdownItem title="动态更新">
          <View style={{ gap: 12, padding: 16 }}>
            <Text style={{ color: accent }}>面板保持打开时切换颜色</Text>
            <Button onPress={() => setAccent(accent === '#722ed1' ? '#d4380d' : '#722ed1')}>
              切换主题色
            </Button>
          </View>
        </DropdownItem>
      </DropdownMenu>
      <Text>背景按钮打开时不可操作；面板内按钮可动态更新样式。</Text>
      <Button onPress={() => setAccent(accent === '#722ed1' ? '#d4380d' : '#722ed1')}>
        切换主题色
      </Button>
    </View>
  )
}
