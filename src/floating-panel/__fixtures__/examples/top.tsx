import React, { useContext, useState } from 'react'

import { FloatingPanel, getFloatingPanelToken, useComponentToken } from '@ftsukic/tsuki'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'

const DAY_HEIGHT = 32
const ROW_GAP = 12
const SUMMARY_GAP = 14
const CONTENT_PADDING = 20
const INITIAL_SUMMARY_HEIGHT = 24 + 18 + SUMMARY_GAP * 2 + DAY_HEIGHT

/**
 * @title 顶部下拉
 * @description 收起显示月份、星期标题和一周日期，下拉展开完整月历；锚点随实际内容高度计算。
 */
export default function FloatingPanelTopExample() {
  const weeks = Array.from({ length: 5 }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => week * 7 + day + 1),
  )
  const token = useComponentToken('FloatingPanel', getFloatingPanelToken)
  const insets = useContext(SafeAreaInsetsContext)
  const [summaryHeight, setSummaryHeight] = useState(INITIAL_SUMMARY_HEIGHT)
  const [calendarHeight, setCalendarHeight] = useState(
    INITIAL_SUMMARY_HEIGHT + CONTENT_PADDING * 3 + DAY_HEIGHT * 4 + ROW_GAP * 3,
  )
  const [expanded, setExpanded] = useState(false)
  const [dragHeight, setDragHeight] = useState<number>()
  const collapsedHeight =
    summaryHeight + CONTENT_PADDING * 2 + token.headerHeight + (insets?.top ?? 0)
  const expandedHeight = Math.max(
    collapsedHeight,
    calendarHeight + token.headerHeight + (insets?.top ?? 0),
  )
  const renderWeek = (days: number[]) => (
    <View style={styles.dateRow}>
      {days.map((day) => (
        <View key={day} style={styles.day}>
          <View style={[styles.dayContent, day === 10 && styles.selectedDay]}>
            <Text style={[styles.dayLabel, day === 10 && styles.selectedDayLabel]}>{day}</Text>
          </View>
        </View>
      ))}
    </View>
  )

  return (
    <View style={styles.page}>
      <Text style={styles.title}>日历页面</Text>
      <Text style={styles.description}>收起保留月份、星期和一周日期，下滑展开完整月历。</Text>
      <View style={styles.pageCard}>
        <Text style={styles.pageCardTitle}>会议安排</Text>
        <Text style={styles.pageCardText}>09:30 产品评审</Text>
        <Text style={styles.pageCardText}>14:00 设计同步</Text>
      </View>

      <FloatingPanel
        testID="floating-panel-top"
        placement="top"
        anchors={[collapsedHeight, expandedHeight]}
        height={dragHeight ?? (expanded ? expandedHeight : collapsedHeight)}
        onHeightChange={setDragHeight}
        onHeightChangeEnd={(height) => {
          setExpanded(height === expandedHeight)
          setDragHeight(undefined)
        }}
      >
        <View
          testID="floating-panel-top-calendar"
          style={styles.calendar}
          onLayout={(event) => setCalendarHeight(event.nativeEvent.layout.height)}
        >
          <View
            testID="floating-panel-top-summary"
            style={styles.summary}
            onLayout={(event) => setSummaryHeight(event.nativeEvent.layout.height)}
          >
            <Text style={styles.calendarTitle}>2026 年 9 月</Text>
            <View style={styles.weekRow}>
              {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                <Text key={day} style={styles.weekDay}>
                  {day}
                </Text>
              ))}
            </View>
            {renderWeek(weeks[0])}
          </View>
          <View style={styles.remainingWeeks}>
            {weeks.slice(1).map((days) => (
              <React.Fragment key={days[0]}>{renderWeek(days)}</React.Fragment>
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
  calendar: { gap: CONTENT_PADDING, padding: CONTENT_PADDING },
  summary: { gap: SUMMARY_GAP },
  remainingWeeks: { gap: ROW_GAP },
  dateRow: { flexDirection: 'row' },
  calendarTitle: {
    color: '#1f2937',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  weekRow: { flexDirection: 'row' },
  weekDay: { flex: 1, color: '#98a2b3', fontSize: 12, lineHeight: 18, textAlign: 'center' },
  day: { flex: 1, height: DAY_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  dayContent: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  dayLabel: { color: '#344054', fontSize: 14 },
  selectedDay: {
    borderRadius: 14,
    backgroundColor: '#1677ff',
  },
  selectedDayLabel: { color: '#ffffff', fontWeight: '600' },
})
