import { useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { LabSection } from '@/components/interaction-lab/common/lab-screen'
import { useOverlayRuntime } from '@tsuki-v2/overlay/use-overlay-runtime'

export function OverlayStackLab() {
  const { entries, mount, update, unmount, hostEnabled, setHostEnabled } = useOverlayRuntime()
  const [ids, setIds] = useState<number[]>([])
  const [revision, setRevision] = useState(0)
  const nextOrder = useRef(1)
  const orderById = useRef(new Map<number, number>())
  const idsRef = useRef(ids)
  idsRef.current = ids

  useEffect(
    () => () => {
      idsRef.current.forEach((id) => unmount(id))
      setHostEnabled(true)
    },
    [setHostEnabled, unmount],
  )

  const addLayer = () => {
    const order = nextOrder.current++
    let id = 0
    id = mount({
      content: <StackLayer order={order} revision={0} onClose={() => removeLayer(id)} />,
      backBehavior: 'consume',
    })
    orderById.current.set(id, order)
    setIds((current) => [...current, id])
  }

  const removeLayer = (id: number) => {
    unmount(id)
    orderById.current.delete(id)
    setIds((current) => current.filter((entryId) => entryId !== id))
  }

  const addThreeLayers = () => {
    addLayer()
    addLayer()
    addLayer()
  }

  const updateTop = () => {
    const id = ids.at(-1)
    if (!id) return
    const nextRevision = revision + 1
    const order = orderById.current.get(id)
    if (!order) return
    update(id, {
      content: <StackLayer order={order} revision={nextRevision} onClose={() => removeLayer(id)} />,
    })
    setRevision(nextRevision)
  }

  const removeMiddle = () => {
    if (ids.length < 2) return
    removeLayer(ids[Math.floor(ids.length / 2)])
  }

  return (
    <>
      <LabSection
        title="Ordered Overlay Stack"
        description="Each card is a real Registry entry. New entries sit above earlier entries; updating one keeps its position."
      >
        <View style={styles.actions}>
          <Action label="Add one" onPress={addLayer} testID="overlay-stack-add" />
          <Action label="Add three" onPress={addThreeLayers} testID="overlay-stack-add-three" />
          <Action label="Update top" onPress={updateTop} testID="overlay-stack-update" />
          <Action
            label="Remove middle"
            onPress={removeMiddle}
            testID="overlay-stack-remove-middle"
          />
          <Action
            label={hostEnabled ? 'Unregister Host' : 'Register Host'}
            onPress={() => setHostEnabled(!hostEnabled)}
            testID="overlay-stack-toggle-host"
          />
          <Action
            label="Clear stack"
            onPress={() => ids.forEach(removeLayer)}
            testID="overlay-stack-clear"
          />
        </View>
        <Text selectable testID="overlay-stack-host-status">
          Host: {hostEnabled ? 'registered' : 'temporarily unregistered'}
        </Text>
        <Text selectable testID="overlay-stack-entry-count">
          Registry entries: {entries.length}
        </Text>
        {ids.length ? (
          <View style={styles.list}>
            {ids.map((id, index) => (
              <Text key={id} selectable testID={`overlay-stack-order-${index + 1}`}>
                Layer {index + 1}: entry {id}
              </Text>
            ))}
          </View>
        ) : (
          <Text>No overlay entries are mounted.</Text>
        )}
      </LabSection>
    </>
  )
}

function StackLayer({
  order,
  revision,
  onClose,
}: {
  order: number
  revision: number
  onClose: () => void
}) {
  return (
    <View
      pointerEvents="box-none"
      style={styles.layer}
      testID={`overlay-stack-layer-content-${order}`}
    >
      <View
        style={[
          styles.card,
          { top: 72 + order * 18, borderColor: order % 2 ? '#60a5fa' : '#c084fc' },
        ]}
      >
        <Text style={styles.title}>Overlay layer {order}</Text>
        <Text selectable>Current revision: {revision}</Text>
        <Text selectable>Back behavior: consume</Text>
        <Action
          label="Close this layer"
          onPress={onClose}
          testID={`overlay-stack-close-${order}`}
        />
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
  list: { gap: 4 },
  layer: { ...StyleSheet.absoluteFill },
  card: {
    position: 'absolute',
    alignSelf: 'center',
    width: '82%',
    maxWidth: 360,
    gap: 10,
    padding: 16,
    borderRadius: 18,
    borderWidth: 2,
    backgroundColor: '#ffffff',
    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.24)',
  },
  title: { fontSize: 17, fontWeight: '700', color: '#0f172a' },
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
