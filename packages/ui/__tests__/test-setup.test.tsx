import { render, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';

describe('React Native test setup', () => {
  it('renders native primitives with the library test environment', async () => {
    await render(
      <View>
        <Text>RN UI test setup</Text>
      </View>,
    );

    expect(screen.getByText('RN UI test setup')).toBeTruthy();
  });
});
