import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { LabSection } from '@/components/interaction-lab/common/lab-screen'
import { useOverlayRuntime } from '@tsuki-v2/overlay/use-overlay-runtime'

export function OverlayTouchLab() {
  const { mount, unmount } = useOverlayRuntime()
  const [ids, setIds] = useState<number[]>([])
  const [pageTaps, setPageTaps] = useState(0)
  const [outsideTaps, setOutsideTaps] = useState(0)
  const [contentTaps, setContentTaps] = useState(0)
  const [topTaps, setTopTaps] = useState(0)
  const [bottomTaps, setBottomTaps] = useState(0)
  const idsRef = useRef(ids)
  idsRef.current = ids

  useEffect(
    () => () => {
      idsRef.current.forEach((id) => unmount(id))
    },
    [unmount],
  )

  const addEntry = (content: ReactNode) => {
    const id = mount({ content, backBehavior: 'passthrough' })
    setIds((current) => [...current, id])
    return id
  }

  const removeEntry = (id: number) => {
    unmount(id)
    setIds((current) => current.filter((entryId) => entryId !== id))
  }

  const addFloating = () => {
    let id = 0
    id = addEntry(<FloatingCard onClose={() => removeEntry(id)} />)
  }

  const addMask = () => {
    let id = 0
    id = addEntry(
      <MaskLayer
        onOutside={() => setOutsideTaps((count) => count + 1)}
        onContent={() => setContentTaps((count) => count + 1)}
        onClose={() => removeEntry(id)}
      />,
    )
  }

  const addLayeredTouch = () => {
    let bottomId = 0
    bottomId = addEntry(
      <BottomTouchLayer
        onTap={() => setBottomTaps((count) => count + 1)}
        onClose={() => removeEntry(bottomId)}
      />,
    )
    let topId = 0
    topId = addEntry(
      <TopTouchLayer
        onTap={() => setTopTaps((count) => count + 1)}
        onClose={() => removeEntry(topId)}
      />,
    )
  }

  return (
    <>
      <LabSection
        title="Touch Routing"
        description="The Host and layer wrappers use box-none; a floating card owns only its visible area, while a mask explicitly owns the full screen."
      >
        <View style={styles.actions}>
          <Action
            label="Show unmasked card"
            onPress={addFloating}
            testID="overlay-touch-floating"
          />
          <Action label="Show full-screen mask" onPress={addMask} testID="overlay-touch-mask" />
          <Action
            label="Add two touch layers"
            onPress={addLayeredTouch}
            testID="overlay-touch-stack"
          />
          <Action
            label="Clear overlays"
            onPress={() => ids.forEach(removeEntry)}
            testID="overlay-touch-clear"
          />
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => setPageTaps((count) => count + 1)}
          style={styles.pageTarget}
          testID="overlay-touch-page-target"
        >
          <Text style={styles.pageTargetLabel}>Underlying page target: {pageTaps} taps</Text>
          <Text style={styles.helper}>
            With the floating card open, tap this area to test pass-through.
          </Text>
        </Pressable>
        <Text selectable testID="overlay-touch-outside-count">
          Mask outside taps: {outsideTaps}
        </Text>
        <Text selectable testID="overlay-touch-content-count">
          Mask content taps: {contentTaps}
        </Text>
        <Text selectable testID="overlay-touch-top-count">
          Top layer taps: {topTaps}
        </Text>
        <Text selectable testID="overlay-touch-bottom-count">
          Bottom mask taps: {bottomTaps}
        </Text>
      </LabSection>
    </>
  )
}

function FloatingCard({ onClose }: { onClose: () => void }) {
  return (
    <View pointerEvents="box-none" style={styles.layer}>
      <View style={styles.floatingCard} testID="overlay-touch-floating-card">
        <Text style={styles.title}>No mask</Text>
        <Text>The space outside this card should reach the page.</Text>
        <Action label="Close" onPress={onClose} testID="overlay-touch-floating-close" />
      </View>
    </View>
  )
}

function MaskLayer({
  onOutside,
  onContent,
  onClose,
}: {
  onOutside: () => void
  onContent: () => void
  onClose: () => void
}) {
  const [outsideTaps, setOutsideTaps] = useState(0)
  const [contentTaps, setContentTaps] = useState(0)

  return (
    <View pointerEvents="box-none" style={styles.layer}>
      <Pressable
        accessibilityLabel="Overlay mask"
        onPress={() => {
          setOutsideTaps((count) => count + 1)
          onOutside()
        }}
        style={styles.mask}
        testID="overlay-touch-mask-area"
      />
      <View style={[styles.maskCard, { zIndex: 1 }]} testID="overlay-touch-mask-content">
        <Text style={styles.title}>Full-screen mask</Text>
        <Text>Outside taps: {outsideTaps}</Text>
        <Text>Content taps: {contentTaps}</Text>
        <Action
          label="Content tap"
          onPress={() => {
            setContentTaps((count) => count + 1)
            onContent()
          }}
          testID="overlay-touch-content-tap"
        />
        <Action label="Close" onPress={onClose} testID="overlay-touch-mask-close" />
      </View>
    </View>
  )
}

function BottomTouchLayer({ onTap, onClose }: { onTap: () => void; onClose: () => void }) {
  const [taps, setTaps] = useState(0)
  return (
    <View pointerEvents="box-none" style={styles.layer}>
      <Pressable
        onPress={() => {
          setTaps((count) => count + 1)
          onTap()
        }}
        style={styles.bottomMask}
        testID="overlay-touch-bottom-mask"
      >
        <Text style={styles.maskLabel}>Bottom mask taps: {taps}</Text>
      </Pressable>
      <View style={styles.bottomControls}>
        <Text style={styles.title}>Bottom overlay</Text>
        <Action label="Close bottom" onPress={onClose} testID="overlay-touch-bottom-close" />
      </View>
    </View>
  )
}

function TopTouchLayer({ onTap, onClose }: { onTap: () => void; onClose: () => void }) {
  const [taps, setTaps] = useState(0)
  return (
    <View pointerEvents="box-none" style={styles.layer}>
      <View style={styles.topCard}>
        <Text style={styles.title}>Top overlay</Text>
        <Text>Top area taps: {taps}</Text>
        <Action
          label="Tap top layer"
          onPress={() => {
            setTaps((count) => count + 1)
            onTap()
          }}
          testID="overlay-touch-top-tap"
        />
        <Action label="Close top" onPress={onClose} testID="overlay-touch-top-close" />
      </View>
    </View>
  )
}

function Action({
  label,
  onPress,
  testID,
}: {
  label: string
  onPress: () => void
  testID: string
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.action} testID={testID}>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  layer: { ...StyleSheet.absoluteFill },
  floatingCard: {
    position: 'absolute',
    top: 72,
    right: 18,
    width: 205,
    gap: 8,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#059669',
    boxShadow: '0 10px 28px rgba(15, 23, 42, 0.24)',
  },
  mask: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(15, 23, 42, 0.56)' },
  maskCard: {
    position: 'absolute',
    top: '34%',
    alignSelf: 'center',
    width: '84%',
    maxWidth: 360,
    gap: 10,
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.3)',
  },
  bottomMask: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 30,
    backgroundColor: 'rgba(30, 64, 175, 0.34)',
  },
  bottomControls: {
    position: 'absolute',
    top: 72,
    zIndex: 1,
    alignSelf: 'center',
    width: '82%',
    gap: 8,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#dbeafe',
  },
  topCard: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    width: '75%',
    gap: 8,
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#f97316',
    backgroundColor: '#fff7ed',
  },
  pageTarget: {
    minHeight: 88,
    justifyContent: 'center',
    gap: 4,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#d1fae5',
  },
  pageTargetLabel: { fontWeight: '700', color: '#064e3b' },
  helper: { fontSize: 12, color: '#065f46' },
  title: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  maskLabel: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  action: {
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#334155',
  },
  actionLabel: { fontSize: 13, fontWeight: '600', color: '#ffffff' },
})
