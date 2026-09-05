import { resolveStyles } from '../style';
import { useComponentToken } from '../theme';
import { getCellToken } from './token';
import type { CellGroupProps } from './interface';
import { View, Text } from 'react-native';

export function CellGroup({
  children,
  testID,
  title,
  extra,
  inset = false,
  border = true,
  style,
  styles,
}: CellGroupProps) {
  const token = useComponentToken('Cell', getCellToken);
  const semantic = resolveStyles(styles, {
    props: { children, testID, title, extra, inset, border, style, styles },
    state: {},
  });

  return (
    <View
      testID={testID}
      style={[
        {
          backgroundColor: token.backgroundColor,
          marginHorizontal: inset ? token.paddingMD : 0,
          borderRadius: inset ? token.insetRadius : 0,
          overflow: inset ? 'hidden' : 'visible',
          borderWidth: border && inset ? 1 : 0,
          borderColor: token.borderColor,
        },
        semantic?.root,
        style,
      ]}
    >
      {title !== undefined || extra !== undefined ? (
        <View
          style={{
            minHeight: token.minHeight,
            paddingHorizontal: token.paddingHorizontal,
            paddingVertical: token.paddingVertical,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {typeof title === 'string' || typeof title === 'number' ? (
            <Text
              style={[
                { color: token.groupTitleColor, fontSize: token.groupTitleFontSize },
                semantic?.title,
              ]}
            >
              {title}
            </Text>
          ) : (
            title
          )}
          {typeof extra === 'string' || typeof extra === 'number' ? (
            <Text
              style={[{ color: token.extraColor, fontSize: token.extraFontSize }, semantic?.extra]}
            >
              {extra}
            </Text>
          ) : (
            extra
          )}
        </View>
      ) : null}
      <View style={[semantic?.body]}>{children}</View>
    </View>
  );
}
