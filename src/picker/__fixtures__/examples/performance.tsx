import { Cell, Picker, Popup } from '@ftsukic/tsuki'
import type { PickerValue } from '@ftsukic/tsuki'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { PerformanceProbeContext } from '../../../performance-probe-context'

const SIZES = [500, 10_000, 100_000] as const
type DataSize = (typeof SIZES)[number]
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

function createOptions(size: DataSize) {
  return Array.from({ length: size }, (_, index) => ({
    text: `选项 ${index + 1}`,
    value: index + 1,
  }))
}

/**
 * @title Picker 大列表冷启动与重复打开
 * @description 对比 500、10000 和 100000 项，分别记录数据准备、索引初始化、Popup 测量和动画。
 */
export default function PickerPerformanceExample() {
  const [size, setSize] = useState<DataSize>(500)
  const [activeSize, setActiveSize] = useState<DataSize>(500)
  const [optionsBySize, setOptionsBySize] = useState(
    () => new Map<DataSize, ReturnType<typeof createOptions>>([[500, createOptions(500)]]),
  )
  const [selectedValue, setSelectedValue] = useState<PickerValue>(250)
  const [pickerValue, setPickerValue] = useState<readonly PickerValue[]>([250])
  const [pickerRevision, setPickerRevision] = useState(0)
  const [dataPreparationMs, setDataPreparationMs] = useState<number | undefined>(0)
  const [mountMode, setMountMode] = useState<MountMode>('cold')
  const [visible, setVisible] = useState(false)
  const [metrics, setMetrics] = useState<OpenMetrics>({ runId: 0, label: '尚未打开' })
  const openCounts = useRef(new Map<string, number>())
  const runSequence = useRef(0)
  const mountedSize = useRef<DataSize | null>(null)
  const popupMeasured = useRef(false)
  const run = useRef<OpenRun | null>(null)
  const options = optionsBySize.get(activeSize) ?? []
  const webLargeListLimited = Platform.OS === 'web' && size === 100_000

  const nextRunId = useCallback(() => {
    runSequence.current += 1
    return runSequence.current
  }, [])

  const invalidateRun = useCallback(
    (label: string) => {
      run.current = null
      setMetrics({ runId: nextRunId(), label })
    },
    [nextRunId],
  )

  const prepareSize = useCallback(
    (nextSize: DataSize) => {
      setSize(nextSize)
      if (mountMode === 'cold') mountedSize.current = null
      invalidateRun(`${nextSize.toLocaleString()} 项 · 尚未打开`)

      const nextValue = Math.min(Number(selectedValue), nextSize)
      setSelectedValue(nextValue)
      setPickerValue([nextValue])

      if (Platform.OS === 'web' && nextSize === 100_000) {
        setDataPreparationMs(undefined)
        return
      }

      const cached = optionsBySize.get(nextSize)
      if (cached) {
        setDataPreparationMs(0)
        return
      }

      const startedAt = now()
      const prepared = createOptions(nextSize)
      setDataPreparationMs(now() - startedAt)
      setOptionsBySize((previous) => new Map(previous).set(nextSize, prepared))
    },
    [invalidateRun, mountMode, optionsBySize, selectedValue],
  )

  const updateMetrics = useCallback((runId: number, update: Partial<OpenMetrics>) => {
    setMetrics((current) => (current.runId === runId ? { ...current, ...update } : current))
  }, [])

  const startOpen = useCallback(() => {
    if (Platform.OS === 'web' && size === 100_000) {
      invalidateRun('100,000 项 · Web 限制，未打开且无测量数据')
      return
    }

    const countKey = `${mountMode}:${size}`
    const openCount = (openCounts.current.get(countKey) ?? 0) + 1
    openCounts.current.set(countKey, openCount)
    const id = nextRunId()
    const pickerReused = mountMode === 'retained' && mountedSize.current === size
    const popupMeasurementReused = popupMeasured.current
    run.current = { id, mode: mountMode, startedAt: now() }
    if (!pickerReused) {
      mountedSize.current = size
      setPickerRevision((revision) => revision + 1)
    }
    setActiveSize(size)
    setMetrics({
      runId: id,
      label: `${size.toLocaleString()} 项 · ${mountMode === 'cold' ? '冷启动' : '保留挂载'} · #${openCount}`,
      pickerReused,
      popupMeasurementReused,
    })
    setVisible(true)
  }, [invalidateRun, mountMode, nextRunId, size])

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
    mountedSize.current = null
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
      updateMetrics(currentRun.id, {
        pickerLayoutMs: now() - currentRun.startedAt,
        pickerReused: false,
      })
    },
    [metrics.runId, updateMetrics],
  )

  const handlePickerChange = useCallback(
    (nextValues: readonly PickerValue[]) => {
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
      const nextValue = nextValues[0]
      if (nextValue !== undefined) {
        setSelectedValue(nextValue)
        setPickerValue([nextValue])
      }
    },
    [metrics.runId, updateMetrics],
  )

  const closeCurrentRun = useCallback(() => {
    if (run.current?.id !== metrics.runId) return
    setVisible(false)
  }, [metrics.runId])

  const handleMountModeChange = useCallback(
    (nextMode: MountMode) => {
      if (nextMode === mountMode) return
      setMountMode(nextMode)
      if (mountMode === 'cold' || nextMode === 'cold') mountedSize.current = null
      invalidateRun(
        `${size.toLocaleString()} 项 · ${nextMode === 'cold' ? '冷启动' : '保留挂载'} · 尚未打开`,
      )
    },
    [invalidateRun, mountMode, size],
  )

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>选项数量</Text>
      <View style={styles.sizes}>
        {SIZES.map((itemSize) => (
          <Pressable
            key={itemSize}
            accessibilityRole="button"
            onPress={() => prepareSize(itemSize)}
            style={[styles.sizeButton, size === itemSize && styles.sizeButtonSelected]}
          >
            <Text style={size === itemSize ? styles.sizeLabelSelected : styles.sizeLabel}>
              {itemSize.toLocaleString()}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.heading}>挂载模式</Text>
      <View style={styles.sizes}>
        <Pressable
          accessibilityRole="button"
          onPress={() => handleMountModeChange('cold')}
          style={[styles.sizeButton, mountMode === 'cold' && styles.sizeButtonSelected]}
        >
          <Text style={mountMode === 'cold' ? styles.sizeLabelSelected : styles.sizeLabel}>
            每次冷启动
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => handleMountModeChange('retained')}
          style={[styles.sizeButton, mountMode === 'retained' && styles.sizeButtonSelected]}
        >
          <Text style={mountMode === 'retained' ? styles.sizeLabelSelected : styles.sizeLabel}>
            保留挂载
          </Text>
        </Pressable>
      </View>
      <Cell
        title={`打开 ${size.toLocaleString()} 项 Picker`}
        value={String(selectedValue)}
        showArrow
        disabled={webLargeListLimited || optionsBySize.get(size)?.length !== size}
        onPress={startOpen}
      />
      <View style={styles.metrics}>
        <Text style={styles.heading}>{metrics.label}</Text>
        <Text>选项数据准备：{formatDuration(dataPreparationMs)}</Text>
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
        选项数据在点击打开前生成，计入独立的准备时间；每次打开时才将选项传给 Picker。冷启动每次卸载
        Picker，保留挂载对同一数量的重复打开复用已布局实例。滚轮可见时间取 Popup
        位移达到已测量高度的 50%；触摸延迟包含滚轮吸附。
      </Text>
      {webLargeListLimited ? (
        <Text accessibilityRole="text" style={styles.webLimit}>
          Web 限制：屏幕阅读器路径要求 Picker 完整渲染所有选项。为避免 100000 项全量渲染耗尽内存，
          此 Fixture 已停用该规模的打开操作，且不会显示虚构的测量结果；iOS 和 Android 仍可测量。
        </Text>
      ) : null}
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
          <Picker
            key={pickerRevision}
            columns={options}
            value={pickerValue}
            onLayout={handlePickerLayout}
            onTouchStart={handleTouchStart}
            onChange={handlePickerChange}
            onConfirm={closeCurrentRun}
            onCancel={closeCurrentRun}
          />
        </Popup>
      </PerformanceProbeContext.Provider>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  heading: { color: '#323233', fontSize: 15, fontWeight: '600' },
  sizes: { flexDirection: 'row', gap: 8 },
  sizeButton: {
    borderColor: '#dcdee0',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sizeButtonSelected: { backgroundColor: '#1989fa', borderColor: '#1989fa' },
  sizeLabel: { color: '#323233', fontSize: 13 },
  sizeLabelSelected: { color: '#ffffff', fontSize: 13 },
  metrics: { backgroundColor: '#f7f8fa', borderRadius: 8, gap: 6, padding: 12 },
  note: { color: '#646566', fontSize: 12, lineHeight: 18 },
  webLimit: { color: '#9a3412', fontSize: 12, lineHeight: 18 },
})
