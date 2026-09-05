import type { IconDefinition } from '@ant-design/icons-svg/lib/types';
import type { ColorValue, PressableProps, StyleProp, ViewStyle } from 'react-native';
import type { SvgProps } from 'react-native-svg';

export interface AntdNativeIconProps extends Omit<
  SvgProps,
  'color' | 'height' | 'width' | 'style' | 'children' | 'onPress'
> {
  definition: IconDefinition;
  size?: number;
  rotation?: number;
  color?: ColorValue;
  style?: StyleProp<ViewStyle>;
  svgStyle?: SvgProps['style'];
  onPress?: PressableProps['onPress'];
  disabled?: boolean;
  touchableSize?: number;
  twoToneColor?: string | readonly [string, string];
}
