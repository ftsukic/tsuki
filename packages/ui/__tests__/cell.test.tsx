import { Cell, ConfigProvider } from '../src';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

describe('Cell', () => {
  it('renders the Vant cell semantics and arrow', async () => {
    await render(
      <ConfigProvider>
        <Cell
          testID="cell"
          icon={<Text>图</Text>}
          title="账户"
          label="已绑定"
          value="查看"
          extra="更多"
          required
          isLink
          arrowDirection="right"
        />
      </ConfigProvider>,
    );

    expect(screen.getByTestId('cell')).toBeTruthy();
    expect(screen.getByText('账户')).toBeTruthy();
    expect(screen.getByText('已绑定')).toBeTruthy();
    expect(screen.getByText('查看')).toBeTruthy();
    expect(screen.getByText('更多')).toBeTruthy();
    expect(screen.getByText('*')).toBeTruthy();
  });

  it('supports Cell.Group inset and group slots', async () => {
    await render(
      <ConfigProvider>
        <Cell.Group testID="group" title="基本信息" extra="编辑" inset>
          <Cell title="昵称" value="Altron" border={false} />
        </Cell.Group>
      </ConfigProvider>,
    );

    expect(screen.getByTestId('group')).toBeTruthy();
    expect(screen.getByText('基本信息')).toBeTruthy();
    expect(screen.getByText('编辑')).toBeTruthy();
    expect(screen.getByText('Altron')).toBeTruthy();
  });
});
