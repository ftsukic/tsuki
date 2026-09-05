import { StyleSheet, Text, View } from 'react-native';
import { ConfigProvider, LoadingIcon } from '../..';

/**
 * @title LoadingIcon
 * @description Preview loading indicators with different sizes and colors.
 */
export default function LoadingBasicFixture() {
  return (
    <ConfigProvider>
      <View style={styles.container}>
        <View style={styles.item}>
          <LoadingIcon size={20} color="#1989fa" duration={900} />
          <Text style={styles.label}>Small</Text>
        </View>
        <View style={styles.item}>
          <LoadingIcon size={28} color="#07c160" duration={1200} />
          <Text style={styles.label}>Large</Text>
        </View>
        <View style={styles.item}>
          <LoadingIcon size={24} color="#ff976a" duration={1500} active={false} />
          <Text style={styles.label}>Paused</Text>
        </View>
      </View>
    </ConfigProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 28,
    padding: 24,
  },
  item: {
    alignItems: 'center',
    gap: 8,
  },
  label: {
    color: '#666666',
    fontSize: 13,
  },
});
