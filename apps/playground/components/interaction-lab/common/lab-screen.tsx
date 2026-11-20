import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from 'react'
import { useRouter } from 'expo-router'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Icon, Text, useToken } from '@ftsukic/tsuki'

interface LabScrollControls {
  setEnabled: (enabled: boolean) => void
}

const LabScrollContext = createContext<LabScrollControls | null>(null)

export function useLabScrollControls() {
  return useContext(LabScrollContext)
}

interface LabScreenProps extends PropsWithChildren {
  title: string
  description: string
  action?: ReactNode
}

export function LabScreen({ title, description, action, children }: LabScreenProps) {
  const router = useRouter()
  const { token } = useToken()
  const [scrollEnabled, setScrollEnabled] = useState(true)
  const scrollControls = useMemo(() => ({ setEnabled: setScrollEnabled }), [])

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: token.colorBgLayout }]}>
      <LabScrollContext.Provider value={scrollControls}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          scrollEnabled={scrollEnabled}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heading}>
            <Pressable
              accessibilityLabel="Back to Interaction Lab"
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => router.back()}
              style={[styles.backButton, { backgroundColor: token.colorBgContainer }]}
            >
              <Icon name="LeftOutlined" size={18} color={token.colorText} />
            </Pressable>
            <View style={styles.headingText}>
              <Text style={styles.title}>{title}</Text>
              <Text style={[styles.description, { color: token.colorTextSecondary }]}>
                {description}
              </Text>
            </View>
          </View>
          {action}
          {children}
        </ScrollView>
      </LabScrollContext.Provider>
    </SafeAreaView>
  )
}

export function LabSection({
  title,
  description,
  children,
}: PropsWithChildren<{ title: string; description?: string }>) {
  const { token } = useToken()

  return (
    <View
      style={[
        styles.section,
        { backgroundColor: token.colorBgContainer, borderColor: token.colorBorder },
      ]}
    >
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {description ? (
          <Text style={[styles.sectionDescription, { color: token.colorTextSecondary }]}>
            {description}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 16, gap: 14 },
  heading: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 8 },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingText: { flex: 1, gap: 4, paddingTop: 1 },
  title: { fontSize: 27, lineHeight: 34, fontWeight: '700' },
  description: { fontSize: 14, lineHeight: 20 },
  section: { borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 14 },
  sectionHeading: { gap: 4 },
  sectionTitle: { fontSize: 17, lineHeight: 23, fontWeight: '700' },
  sectionDescription: { fontSize: 13, lineHeight: 19 },
})
