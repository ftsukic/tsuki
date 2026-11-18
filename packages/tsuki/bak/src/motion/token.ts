// Internal design values shared by effects, semantic presets, and animation drivers.
export const MOTION_DURATION = {
  instant: 0,
  fastest: 100,
  fast: 140,
  normal: 200,
  base: 240,
  slow: 300,
  slower: 400,
}
export const MOTION_DISTANCE = { xxs: 2, xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 }
export const MOTION_SCALE = {
  pressed: 0.96,
  subtlePressed: 0.985,
  iconPressed: 0.92,
  enter: 0.96,
  subtleEnter: 0.98,
  overshoot: 1.04,
  selection: 0.6,
}
export const MOTION_LOOP_DURATION = { spin: 1000, pulse: 1200 }
export const MOTION_SHAKE_STOPS = [0, -4, 4, -3, 3, -2, 2, 0]
export const MOTION_SPRING = {
  soft: { damping: 22, stiffness: 180, mass: 1 },
  normal: { damping: 20, stiffness: 240, mass: 1 },
  responsive: { damping: 18, stiffness: 300, mass: 0.9 },
  bouncy: { damping: 14, stiffness: 280, mass: 0.9 },
  magnetic: { damping: 30, stiffness: 600, mass: 0.8 },
}
