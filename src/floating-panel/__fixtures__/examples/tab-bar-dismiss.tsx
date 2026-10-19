import React from 'react'

import { FloatingPanel } from '@ftsukic/tsuki'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import { useContext, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

const TAB_BAR_HEIGHT = 64

/**
 * @title Tab bar 上方弹出并下拉关闭
 * @description 点击底部“更多”tab 打开，再点一次、点遮罩或向下拖过最小锚点关闭。
 */
export default function FloatingPanelTabBarDismissExample() {
  const insets = useContext(SafeAreaInsetsContext)
  const [visible, setVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('工作台')

  const handleTabPress = (item: string) => {
    if (item === '更多') {
      setVisible((current) => !current)
      return
    }
    setActiveTab(item)
    setVisible(false)
  }

  return (
    <View style={styles.page}>
      <View style={styles.pageContent}>
        <Text style={styles.title}>工作台</Text>
        <Text style={styles.description}>面板从底部导航上方弹出，导航栏保持可见。</Text>
      </View>
      <FloatingPanel
        testID="floating-panel-tab-bar-dismiss"
        visible={visible}
        onVisibleChange={setVisible}
        overlay
        closeOnPressOverlay
        portalHostName="floating-panel-tabs"
        bottomOffset={TAB_BAR_HEIGHT + (insets?.bottom ?? 0)}
        anchors={[120, 320, 520]}
        defaultHeight={320}
      >
        <View style={styles.content}>
          <Text style={styles.panelTitle}>快捷工作台</Text>
          <Text style={styles.description}>可上下拖动切换高度；继续向下拖动即可关闭。</Text>
        </View>
      </FloatingPanel>

      <View style={styles.tabBar}>
        {['消息', '工作台', '云文档', '更多'].map((item) => (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: item === activeTab || (item === '更多' && visible) }}
            key={item}
            onPress={() => handleTabPress(item)}
            style={styles.tab}
          >
            <Text
              style={[
                styles.tabText,
                item === activeTab || (item === '更多' && visible) ? styles.activeTabText : null,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f7f8fa' },
  pageContent: { gap: 12, padding: 20 },
  title: { color: '#1f2937', fontSize: 20, fontWeight: '600' },
  description: { color: '#68788d', lineHeight: 22 },
  content: { gap: 8, padding: 20 },
  panelTitle: { color: '#1f2937', fontSize: 18, fontWeight: '600' },
  tabBar: {
    position: 'absolute',
    right: 0,
    // Keep the bar aligned to the page edges; content padding lives in pageContent.
    bottom: 0,
    left: 0,
    height: TAB_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  tab: { padding: 12 },
  tabText: { color: '#68788d', fontSize: 12 },
  activeTabText: { color: '#1677ff', fontWeight: '600' },
})
