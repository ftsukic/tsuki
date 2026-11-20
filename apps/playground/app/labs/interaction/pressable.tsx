import { LabScreen, LabSection } from '@/components/interaction-lab/common/lab-screen'
import { FeedbackLab } from '@/components/interaction-lab/pressable/feedback-lab'
import { StyleConflictLab } from '@/components/interaction-lab/pressable/style-conflict-lab'
import { Text } from '@ftsukic/tsuki'

export default function PressableLab() {
  return (
    <LabScreen
      title="Pressable Lab"
      description="Exercise the internal v2 Pressable runtime and native event pipeline."
    >
      <LabSection title="Press Feedback">
        <Text>Feedback modes, press state, events, and style conflicts are available here.</Text>
      </LabSection>
      <FeedbackLab />
      <StyleConflictLab />
    </LabScreen>
  )
}
