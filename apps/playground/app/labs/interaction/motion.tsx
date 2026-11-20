import { LabScreen, LabSection } from '@/components/interaction-lab/common/lab-screen'
import { DecayLab } from '@/components/interaction-lab/motion/decay-lab'
import { InterruptionLab } from '@/components/interaction-lab/motion/interruption-lab'
import { MotionPolicyLab } from '@/components/interaction-lab/motion/motion-policy-lab'
import { PresetLab } from '@/components/interaction-lab/motion/preset-lab'
import { SharedValueLab } from '@/components/interaction-lab/motion/shared-value-lab'
import { SpringLab } from '@/components/interaction-lab/motion/spring-lab'
import { TimingLab } from '@/components/interaction-lab/motion/timing-lab'
import { TimingSpringCompareLab } from '@/components/interaction-lab/motion/timing-spring-compare-lab'
import { Text } from '@ftsukic/tsuki'

export default function MotionLab() {
  return (
    <LabScreen
      title="Motion Lab"
      description="Tune real Reanimated animations through the private v2 Motion runtime."
    >
      <LabSection title="Motion Runtime">
        <Text>
          Timing, spring, decay, preset, interruption, policy, and shared-value controls are
          available here.
        </Text>
      </LabSection>
      <TimingSpringCompareLab />
      <TimingLab />
      <SpringLab />
      <DecayLab />
      <PresetLab />
      <InterruptionLab />
      <MotionPolicyLab />
      <SharedValueLab />
    </LabScreen>
  )
}
