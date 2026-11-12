jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'))
jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual('react-native-reanimated')
  actual.configureReanimatedLogger({ level: 'warn', strict: false })

  return {
    __esModule: true,
    ...actual,
    createAnimatedComponent: (Component) => Component,
    useAnimatedStyle: jest.fn((updater) => updater()),
    withTiming: jest.fn(actual.withTiming),
    withSpring: jest.fn(actual.withSpring),
    withRepeat: jest.fn((animation, ...args) =>
      animation && (typeof animation === 'object' || typeof animation === 'function')
        ? actual.withRepeat(animation, ...args)
        : (animation ?? 0),
    ),
  }
})
require('react-native-reanimated').setUpTests()
