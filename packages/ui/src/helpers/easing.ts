import { Easing } from 'react-native'

const easing = {
  linear: Easing.linear,
  ease: Easing.ease,
  quad: Easing.quad,
  cubic: Easing.cubic,
  sin: Easing.sin,
  circle: Easing.circle,
  exp: Easing.exp,
  elastic: Easing.elastic,
  back: Easing.back,
  bounce: Easing.bounce,
  bezier: Easing.bezier,
  in: Easing.in,
  out: Easing.out,
  inOut: Easing.inOut,
  easeIn: Easing.bezier(0.42, 0, 1, 1),
  easeOut: Easing.bezier(0, 0, 0.58, 1),
  easeInOut: Easing.bezier(0.42, 0, 0.58, 1),
  easeInCubic: Easing.bezier(0.55, 0.055, 0.675, 0.19),
  easeOutCubic: Easing.bezier(0.215, 0.61, 0.355, 1),
  easeInOutCubic: Easing.bezier(0.645, 0.045, 0.355, 1),
  easeOutCirc: Easing.bezier(0.075, 0.82, 0.165, 1),
  easeInQuint: Easing.bezier(0.755, 0.05, 0.855, 0.06),
  easeOutQuint: Easing.bezier(0.23, 1, 0.32, 1),
  easeInOutQuint: Easing.bezier(0.86, 0, 0.07, 1),
}

export default easing
