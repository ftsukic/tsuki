import { useState } from 'react'
import { Text, View } from 'react-native'
import { Popup } from '../../../popup'
import { Collapse, CollapseItem } from '../../../collapse'
import { MotionPressable } from '../..'
import { demoStyles as styles } from '../style'

/**
 * @title 组件动效
 * @description 查看 Popup 的退出卸载与 Collapse 的动态内容高度，两个示例独立操作。
 */
export default function ComponentMotionExample() {
  const [visible, setVisible] = useState(false)
  const [status, setStatus] = useState('浮层未打开')
  const [more, setMore] = useState(false)
  return (
    <View style={styles.page}>
      <MotionPressable
        accessibilityRole="button"
        style={styles.button}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.buttonText}>打开浮层</Text>
      </MotionPressable>
      <Text accessibilityLiveRegion="polite" style={styles.status}>
        {status}
      </Text>
      <Popup
        visible={visible}
        position="bottom"
        round
        destroyOnClosed
        onRequestClose={() => setVisible(false)}
        onOpen={() => setStatus('浮层进入中')}
        onOpened={() => setStatus('浮层已打开')}
        onClose={() => setStatus('浮层退出中')}
        onClosed={() => setStatus('浮层已关闭，内容已卸载')}
      >
        <View style={styles.page}>
          <Text style={styles.description}>面板与遮罩同步，退出完成后卸载内容。</Text>
          <MotionPressable
            accessibilityRole="button"
            style={styles.button}
            onPress={() => setVisible(false)}
          >
            <Text style={styles.buttonText}>关闭浮层</Text>
          </MotionPressable>
        </View>
      </Popup>
      <Collapse defaultValue={['content']}>
        <CollapseItem name="content" title="动态内容折叠">
          <View style={styles.page}>
            <MotionPressable
              accessibilityRole="button"
              style={styles.button}
              onPress={() => setMore((value) => !value)}
            >
              <Text style={styles.buttonText}>{more ? '减少内容' : '增加内容'}</Text>
            </MotionPressable>
            <Text style={styles.description}>内容变化后更新折叠区域的高度。</Text>
            {more ? (
              <Text style={styles.description}>新增内容参与测量。点击标题可以折叠或重新展开。</Text>
            ) : null}
          </View>
        </CollapseItem>
      </Collapse>
    </View>
  )
}
