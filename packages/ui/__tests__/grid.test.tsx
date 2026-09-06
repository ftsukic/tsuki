import { cleanup, render, screen } from '@testing-library/react-native'
import { Col, Row } from '../src'
import { Text } from 'react-native'

afterEach(cleanup)

test('renders columns inside a row', async () => {
  await render(
    <Row gap={8}>
      <Col span={12}>
        <Text>左</Text>
      </Col>
      <Col span={12}>
        <Text>右</Text>
      </Col>
    </Row>,
  )

  expect(screen.getByText('左')).toBeTruthy()
  expect(screen.getByText('右')).toBeTruthy()
})
