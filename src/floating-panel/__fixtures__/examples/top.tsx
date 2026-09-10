import React from 'react'

import { FloatingPanel } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title 顶部下拉
 * @description placement="top" 让面板从顶部展开，拖拽条位于底部并保留底部圆角与阴影。
 */
export default function FloatingPanelTopExample() {
  const days = Array.from({ length: 35 }, (_, index) => index + 1)

  return (
    <View style={styles.page}>
      <Text style={styles.title}>日历页面</Text>
      <Text style={styles.description}>顶部面板可以向下展开，拖动底部横条收起。</Text>
      <View style={styles.pageCard}>
        <Text style={styles.pageCardTitle}>会议安排</Text>
        <Text style={styles.pageCardText}>09:30 产品评审</Text>
        <Text style={styles.pageCardText}>14:00 设计同步</Text>
      </View>

      <FloatingPanel placement="top" anchors={[180, 420]} defaultHeight={180}>
        <View style={styles.calendar}>
          <Text style={styles.calendarTitle}>2026 年 9 月</Text>
          <View style={styles.weekRow}>
            {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
              <Text key={day} style={styles.weekDay}>
                {day}
              </Text>
            ))}
          </View>
          <View style={styles.dayGrid}>
            {days.map((day) => (
              <View key={day} style={[styles.day, day === 10 && styles.selectedDay]}>
                <Text style={[styles.dayLabel, day === 10 && styles.selectedDayLabel]}>{day}</Text>
              </View>
            ))}
          </View>
        </View>
      </FloatingPanel>
    </View>
  )
}

const styles = StyleSheet.create({
  page: { minHeight: 560, gap: 12, padding: 20, backgroundColor: '#f7f8fa' },
  title: { color: '#1f2937', fontSize: 20, fontWeight: '600' },
  description: { color: '#68788d', lineHeight: 22 },
  pageCard: { gap: 8, marginTop: 24, padding: 18, borderRadius: 12, backgroundColor: '#ffffff' },
  pageCardTitle: { color: '#1f2937', fontSize: 16, fontWeight: '600' },
  pageCardText: { color: '#68788d', lineHeight: 24 },
  calendar: { gap: 14, padding: 20 },
  calendarTitle: { color: '#1f2937', fontSize: 18, fontWeight: '600', textAlign: 'center' },
  weekRow: { flexDirection: 'row' },
  weekDay: { flex: 1, color: '#98a2b3', fontSize: 12, textAlign: 'center' },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 12 },
  day: { width: '14.2857%', alignItems: 'center' },
  dayLabel: { color: '#344054', fontSize: 14 },
  selectedDay: {
    width: '14.2857%',
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#1677ff',
  },
  selectedDayLabel: { color: '#ffffff', fontWeight: '600' },
})
