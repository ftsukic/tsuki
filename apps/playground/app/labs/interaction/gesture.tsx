import { LabScreen, LabSection } from '@/components/interaction-lab/common/lab-screen'
import { NestedScrollLab } from '@/components/interaction-lab/gesture/nested-scroll-lab'
import { PanLab } from '@/components/interaction-lab/gesture/pan-lab'
import { ResistanceLab } from '@/components/interaction-lab/gesture/resistance-lab'
import { SnapLab } from '@/components/interaction-lab/gesture/snap-lab'
import { SwipeLab } from '@/components/interaction-lab/gesture/swipe-lab'
import { Text } from '@ftsukic/tsuki'

export default function GestureLab() {
  return (
    <LabScreen
      title="Gesture Lab"
      description="Explore native pan, swipe, resistance, snapping, and scroll coordination."
    >
      <LabSection title="Gesture Runtime">
        <Text>
          These experiments use the private v2 Pan and Swipe runtime. Movement stays on the UI
          thread; the values below update on direction, lifecycle, or release events.
        </Text>
      </LabSection>
      <PanLab />
      <SwipeLab />
      <ResistanceLab />
      <SnapLab />
      <NestedScrollLab />
    </LabScreen>
  )
}
