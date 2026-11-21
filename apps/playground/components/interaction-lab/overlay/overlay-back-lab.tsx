import { useEffect, useRef, useState } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { LabSection } from '@/components/interaction-lab/common/lab-screen'
import { useOverlayRuntime } from '@tsuki-v2/overlay/use-overlay-runtime'
import type { OverlayBackBehavior } from '@tsuki-v2/overlay/types'

export function OverlayBackLab() {
  const { entries, mount, unmount, backResult } = useOverlayRuntime()
  const [ids, setIds] = useState<number[]>([])
  const idsRef = useRef(ids)
  idsRef.current = ids

  useEffect(
    () => () => {
      idsRef.current.forEach((id) => unmount(id))
    },
    [unmount],
  )

  const removeLayer = (id: number) => {
    unmount(id)
    setIds((current) => current.filter((entryId) => entryId !== id))
  }

  const addLayer = (backBehavior: OverlayBackBehavior) => {
    let id = 0
    id = mount({
      content: <BackLayer behavior={backBehavior} onClose={() => removeLayer(id)} />,
      backBehavior,
      onBack:
        backBehavior === 'dismiss'
          ? () => {
              removeLayer(id)
            }
          : undefined,
    })
    setIds((current) => [...current, id])
  }

  const addPair = (topBehavior: OverlayBackBehavior) => {
    addLayer('dismiss')
    addLayer(topBehavior)
  }

  return (
    <LabSection
      title="Host Back Dispatch"
      description="Only the top visible entry receives Back. passthrough returns false to navigation without scanning lower entries."
    >
      <View style={styles.actions}>
        <Action
          label="Add dismiss"
          onPress={() => addLayer('dismiss')}
          testID="overlay-back-add-dismiss"
        />
        <Action
          label="Add consume"
          onPress={() => addLayer('consume')}
          testID="overlay-back-add-consume"
        />
        <Action
          label="Add passthrough"
          onPress={() => addLayer('passthrough')}
          testID="overlay-back-add-passthrough"
        />
        <Action
          label="Dismiss below + consume top"
          onPress={() => addPair('consume')}
          testID="overlay-back-add-consume-pair"
        />
        <Action
          label="Dismiss below + passthrough top"
          onPress={() => addPair('passthrough')}
          testID="overlay-back-add-passthrough-pair"
        />
        <Action
          label="Clear entries"
          onPress={() => ids.forEach(removeLayer)}
          testID="overlay-back-clear"
        />
      </View>
      <Text selectable testID="overlay-back-platform">
        Platform: {Platform.OS as string}
      </Text>
      <Text selectable testID="overlay-back-result">
        Back event {backResult.count}:{' '}
        {backResult.count ? (backResult.consumed ? 'consumed' : 'passed through') : 'not exercised'}
      </Text>
      <Text selectable>Current Registry entries: {entries.length}</Text>
      <Text selectable>Press the Android hardware Back control to exercise the Host listener.</Text>
    </LabSection>
  )
}

function BackLayer({ behavior, onClose }: { behavior: OverlayBackBehavior; onClose: () => void }) {
  return (
    <View pointerEvents="box-none" style={styles.layer}>
      <View style={styles.card}>
        <Text style={styles.title}>Top overlay</Text>
        <Text>Back behavior: {behavior}</Text>
        <Text>Manual close remains available for consume and passthrough.</Text>
        <Action label="Close overlay" onPress={onClose} testID="overlay-back-close" />
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
  card: {
    position: 'absolute',
    top: '36%',
    alignSelf: 'center',
    width: '84%',
    maxWidth: 360,
    gap: 10,
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#7c3aed',
    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.24)',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
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
