import { Cell, Popup, TimePicker } from '@ftsukic/tsuki'
import type { TimePickerValue } from '@ftsukic/tsuki'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { PerformanceProbeContext } from '../../../performance-probe-context'

type MountMode = 'cold' | 'retained'

interface OpenRun {
  id: number
  mode: MountMode
  startedAt: number
  popupStartedAt?: number
  popupMeasuredAt?: number
  firstTouchAt?: number
  pickerLayoutRecorded?: boolean
  popupLayoutRecorded?: boolean
  wheelLayoutRecorded?: boolean
  wheelVisibleRecorded?: boolean
  firstChangeRecorded?: boolean
}

interface OpenMetrics {
  runId: number
  label: string
  pickerLayoutMs?: number
  pickerReused?: boolean
  wheelOptionLayoutMs?: number
  wheelOptionVisibleMs?: number
  popupMeasurementMs?: number
  popupMeasurementReused?: boolean
  popupAnimationCompleteMs?: number
  popupAnimationMs?: number
  firstTouchToChangeMs?: number
}

function now() {
  return typeof performance === 'undefined' ? Date.now() : performance.now()
}

function formatDuration(value: number | undefined) {
  return value === undefined ? '—' : `${value.toFixed(1)} ms`
}

function formatLayout(value: number | undefined, reused: boolean | undefined) {
  return reused ? '复用（无新布局）' : formatDuration(value)
}

/**
 * @title TimePicker 冷启动与保留挂载
 * @description 分别记录 Picker 布局、滚轮中间选项可见、Popup 测量与动画、首次触摸后的值处理。
 */
export default function TimePickerOpenPerformanceExample() {
  const [visible, setVisible] = useState(false)
  const [value, setValue] = useState<TimePickerValue>(['12', '30'])
  const [mountMode, setMountMode] = useState<MountMode>('cold')
  const [pickerRevision, setPickerRevision] = useState(0)
  const [metrics, setMetrics] = useState<OpenMetrics>({ runId: 0, label: '尚未打开' })
  const openCount = useRef(0)
  const pickerMounted = useRef(false)
  const popupMeasured = useRef(false)
  const run = useRef<OpenRun | null>(null)

  const updateMetrics = useCallback((runId: number, update: Partial<OpenMetrics>) => {
    setMetrics((current) => (current.runId === runId ? { ...current, ...update } : current))
  }, [])

  const startOpen = useCallback(() => {
    const id = ++openCount.current
    const pickerReused = mountMode === 'retained' && pickerMounted.current
    const popupMeasurementReused = mountMode === 'retained' && popupMeasured.current
    const currentRun: OpenRun = { id, mode: mountMode, startedAt: now() }
    run.current = currentRun
    if (mountMode === 'cold') setPickerRevision((revision) => revision + 1)
    setMetrics({
      runId: id,
      label: `${mountMode === 'cold' ? '冷启动' : '保留挂载'} · ${pickerReused ? '重复打开' : '首次挂载'} #${id}`,
      pickerReused,
      popupMeasurementReused,
    })
    setVisible(true)
  }, [mountMode])

  const handlePickerOptionLayout = useCallback(
    (runId: number, columnIndex: number) => {
      if (columnIndex !== 0) return
      const currentRun = run.current
      if (!currentRun || currentRun.id !== runId || currentRun.wheelLayoutRecorded) return
      currentRun.wheelLayoutRecorded = true
      updateMetrics(runId, { wheelOptionLayoutMs: now() - currentRun.startedAt })
    },
    [updateMetrics],
  )

  const handlePopupFirstVisible = useCallback(
    (runId: number) => {
      const currentRun = run.current
      if (!currentRun || currentRun.id !== runId || currentRun.wheelVisibleRecorded) return
      currentRun.wheelVisibleRecorded = true
      updateMetrics(runId, { wheelOptionVisibleMs: now() - currentRun.startedAt })
    },
    [updateMetrics],
  )

  const probe = useMemo(
    () => ({
      runId: metrics.runId,
      onPickerOptionLayout: handlePickerOptionLayout,
      onPopupFirstVisible: handlePopupFirstVisible,
    }),
    [handlePickerOptionLayout, handlePopupFirstVisible, metrics.runId],
  )

  const handlePopupOpen = useCallback(() => {
    const currentRun = run.current
    if (!currentRun || currentRun.id !== metrics.runId) return
    currentRun.popupStartedAt = now()
  }, [metrics.runId])

  const handlePopupLayout = useCallback(() => {
    const currentRun = run.current
    if (!currentRun || currentRun.id !== metrics.runId || currentRun.popupLayoutRecorded) return
    currentRun.popupLayoutRecorded = true
    currentRun.popupMeasuredAt = now()
    popupMeasured.current = true
    updateMetrics(currentRun.id, {
      popupMeasurementMs: currentRun.popupMeasuredAt - currentRun.startedAt,
      popupMeasurementReused: false,
    })
  }, [metrics.runId, updateMetrics])

  const handlePopupOpened = useCallback(() => {
    const currentRun = run.current
    if (!currentRun || currentRun.id !== metrics.runId) return
    const openedAt = now()
    const animationStartAt =
      currentRun.popupMeasuredAt ?? currentRun.popupStartedAt ?? currentRun.startedAt
    updateMetrics(currentRun.id, {
      popupAnimationCompleteMs: openedAt - currentRun.startedAt,
      popupAnimationMs: openedAt - animationStartAt,
    })
  }, [metrics.runId, updateMetrics])

  const handlePopupClosed = useCallback(() => {
    const currentRun = run.current
    if (!currentRun || currentRun.id !== metrics.runId || currentRun.mode !== 'cold') return
    pickerMounted.current = false
    popupMeasured.current = false
  }, [metrics.runId])

  const handleTouchStart = useCallback(() => {
    const currentRun = run.current
    if (
      visible &&
      currentRun &&
      currentRun.id === metrics.runId &&
      currentRun.firstTouchAt === undefined
    ) {
      currentRun.firstTouchAt = now()
    }
  }, [metrics.runId, visible])

  const handlePickerLayout = useCallback(
    (event: { nativeEvent: { layout: { width: number; height: number } } }) => {
      const { width, height } = event.nativeEvent.layout
      const currentRun = run.current
      if (
        !currentRun ||
        currentRun.id !== metrics.runId ||
        currentRun.pickerLayoutRecorded ||
        width <= 0 ||
        height <= 0
      ) {
        return
      }
      currentRun.pickerLayoutRecorded = true
      if (currentRun.mode === 'retained') pickerMounted.current = true
      updateMetrics(currentRun.id, {
        pickerLayoutMs: now() - currentRun.startedAt,
        pickerReused: false,
      })
    },
    [metrics.runId, updateMetrics],
  )

  const handlePickerChange = useCallback(
    (nextValue: TimePickerValue) => {
      const currentRun = run.current
      if (!currentRun || currentRun.id !== metrics.runId) return
      if (!currentRun.firstChangeRecorded) {
        currentRun.firstChangeRecorded = true
        if (currentRun.firstTouchAt !== undefined) {
          updateMetrics(currentRun.id, {
            firstTouchToChangeMs: now() - currentRun.firstTouchAt,
          })
        }
      }
      setValue(nextValue)
    },
    [metrics.runId, updateMetrics],
  )

  const closeCurrentRun = useCallback(() => {
    if (run.current?.id !== metrics.runId) return
    setVisible(false)
  }, [metrics.runId])

  const confirmCurrentRun = useCallback(
    (nextValue: TimePickerValue) => {
      if (run.current?.id !== metrics.runId) return
      setValue(nextValue)
      setVisible(false)
    },
    [metrics.runId],
  )

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>挂载模式</Text>
      <View style={styles.modes}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setMountMode('cold')}
          style={[styles.modeButton, mountMode === 'cold' && styles.modeButtonSelected]}
        >
          <Text style={mountMode === 'cold' ? styles.modeLabelSelected : styles.modeLabel}>
            每次冷启动
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => setMountMode('retained')}
          style={[styles.modeButton, mountMode === 'retained' && styles.modeButtonSelected]}
        >
          <Text style={mountMode === 'retained' ? styles.modeLabelSelected : styles.modeLabel}>
            保留挂载
          </Text>
        </Pressable>
      </View>
      <Cell title="打开 TimePicker" value={value.join(':')} showArrow onPress={startOpen} />
      <View style={styles.metrics}>
        <Text style={styles.heading}>{metrics.label}</Text>
        <Text>
          点击 → Picker 根节点布局：{formatLayout(metrics.pickerLayoutMs, metrics.pickerReused)}
        </Text>
        <Text>点击 → 中间滚轮选项可见：{formatDuration(metrics.wheelOptionVisibleMs)}</Text>
        <Text>
          点击 → 选中滚轮项完成布局：
          {formatLayout(metrics.wheelOptionLayoutMs, metrics.pickerReused)}
        </Text>
        <Text>
          Popup 尺寸测量：
          {formatLayout(metrics.popupMeasurementMs, metrics.popupMeasurementReused)}
        </Text>
        <Text>点击 → Popup 动画完成：{formatDuration(metrics.popupAnimationCompleteMs)}</Text>
        <Text>Popup 动画阶段：{formatDuration(metrics.popupAnimationMs)}</Text>
        <Text>首次触摸事件 → 首次值变更：{formatDuration(metrics.firstTouchToChangeMs)}</Text>
      </View>
      <Text style={styles.note}>
        冷启动使用 destroyOnClosed，每次关闭后卸载 Picker；保留挂载会复用已布局的
        Picker。滚轮可见时间取 Popup 位移达到已测量高度的 50%（中间选项进入屏幕边缘），Popup
        动画完成取 onOpened。打开后触摸并改变一个时间值，可记录触摸事件到 onChange
        的延迟；其中包含滚轮吸附。
      </Text>
      <PerformanceProbeContext.Provider value={probe}>
        <Popup
          destroyOnClosed={mountMode === 'cold'}
          lazyRender
          position="bottom"
          round
          safeAreaInsetBottom
          visible={visible}
          onLayout={handlePopupLayout}
          onOpen={handlePopupOpen}
          onOpened={handlePopupOpened}
          onClosed={handlePopupClosed}
          onRequestClose={closeCurrentRun}
        >
          <TimePicker
            key={pickerRevision}
            value={value}
            onLayout={handlePickerLayout}
            onTouchStart={handleTouchStart}
            onChange={handlePickerChange}
            onCancel={closeCurrentRun}
            onConfirm={confirmCurrentRun}
          />
        </Popup>
      </PerformanceProbeContext.Provider>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  heading: { color: '#323233', fontSize: 15, fontWeight: '600' },
  modes: { flexDirection: 'row', gap: 8 },
  modeButton: {
    borderColor: '#dcdee0',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modeButtonSelected: { backgroundColor: '#1989fa', borderColor: '#1989fa' },
  modeLabel: { color: '#323233', fontSize: 13 },
  modeLabelSelected: { color: '#ffffff', fontSize: 13 },
  metrics: { backgroundColor: '#f7f8fa', borderRadius: 8, gap: 6, padding: 12 },
  note: { color: '#646566', fontSize: 12, lineHeight: 18 },
})
