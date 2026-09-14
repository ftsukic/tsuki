import { ConfigProvider, Input, getDesignToken } from '..'
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { useState } from 'react'
import { Platform, StyleSheet } from 'react-native'
import { getInputStyles, getTextareaMetrics } from '../input/style'
import { getInputToken } from '../input/token'

describe('Input', () => {
  function getInputStyle(testID: string) {
    return StyleSheet.flatten(screen.getByTestId(testID).props.style)
  }

  function getMeasurementInput(testID: string) {
    return screen.getByTestId(`${testID}__measure`, { includeHiddenElements: true })
  }

  it('does not enable multiline implicitly for autoSize', async () => {
    await render(<Input testID="single-line-auto-size" autoSize />)

    const input = screen.getByTestId('single-line-auto-size')
    expect(input.props.multiline).not.toBe(true)
    expect(input.props.scrollEnabled).toBeUndefined()
  })

  it('uses the Vant 24/10/16 contract for single-line sizes', () => {
    const token = getInputToken(getDesignToken())
    expect(token.lineHeight).toBe(24)
    expect(token.paddingVertical).toBe(10)
    expect(token.paddingHorizontal).toBe(16)
    expect(token).not.toHaveProperty('heightSM')
    expect(token).not.toHaveProperty('height')
    expect(token).not.toHaveProperty('heightLG')

    const stylesBySize = {
      small: getInputStyles(token, { size: 'small' }, { focused: false, disabled: false }),
      normal: getInputStyles(token, { size: 'normal' }, { focused: false, disabled: false }),
      large: getInputStyles(token, { size: 'large' }, { focused: false, disabled: false }),
    }

    for (const styles of Object.values(stylesBySize)) {
      expect(styles.singleShell.height).toBeUndefined()
      expect(styles.singleShell.minHeight).toBeUndefined()
      expect(styles.singleShell.paddingVertical).toBe(token.paddingVertical)
      expect(styles.singleShell.alignContent).toBeUndefined()
      expect(styles.singleInput.height).toBeUndefined()
      expect(styles.singleInput.minHeight).toBeUndefined()
      expect(styles.singleInput.paddingVertical).toBe(0)
      expect(styles.singleInput.alignSelf).toBe('center')
      expect(styles.shell.paddingHorizontal).toBe(token.paddingHorizontal)
      expect(styles.input.paddingHorizontal).toBe(0)
      const nativeInputStyle = StyleSheet.flatten([styles.input, styles.singleInput])
      expect(nativeInputStyle.height).toBeUndefined()
      expect(nativeInputStyle.minHeight).toBeUndefined()
      expect(nativeInputStyle.paddingVertical).toBe(0)
    }

    expect(
      StyleSheet.flatten([stylesBySize.small.input, stylesBySize.small.singleInput]),
    ).toMatchObject({ fontSize: token.fontSizeSM })
    expect(
      StyleSheet.flatten([stylesBySize.normal.input, stylesBySize.normal.singleInput]),
    ).toMatchObject({ fontSize: token.fontSize })
    expect(
      StyleSheet.flatten([stylesBySize.large.input, stylesBySize.large.singleInput]),
    ).toMatchObject({ fontSize: token.fontSizeLG })

    expect(stylesBySize.small.input.lineHeight).toBe(
      Platform.OS === 'ios' ? undefined : token.lineHeightSM,
    )
    expect(stylesBySize.normal.input.lineHeight).toBe(
      Platform.OS === 'ios' ? undefined : token.lineHeight,
    )
    expect(stylesBySize.large.input.lineHeight).toBe(
      Platform.OS === 'ios' ? undefined : token.lineHeightLG,
    )
    expect(stylesBySize.small.singleContent.minHeight).toBe(
      Platform.OS === 'ios' ? token.lineHeightSM : undefined,
    )
    expect(stylesBySize.normal.singleContent.minHeight).toBe(
      Platform.OS === 'ios' ? token.lineHeight : undefined,
    )
    expect(stylesBySize.large.singleContent.minHeight).toBe(
      Platform.OS === 'ios' ? token.lineHeightLG : undefined,
    )
  })

  it('removes standalone single-line spacing while keeping textarea padding', () => {
    const token = getInputToken(getDesignToken())
    const state = { focused: false, disabled: false }
    const singleStyles = getInputStyles(token, { size: 'normal' }, state, true)
    const textareaStyles = getInputStyles(token, { multiline: true, rows: 2 }, state, true)
    const textareaMetrics = getTextareaMetrics(token, 'normal')

    expect(singleStyles.shell).toMatchObject({
      paddingHorizontal: 0,
      borderWidth: 0,
      borderRadius: 0,
      backgroundColor: 'transparent',
    })
    expect(singleStyles.singleShell.paddingVertical).toBe(0)
    expect(singleStyles.input).toMatchObject({
      fontSize: token.fontSize,
      paddingHorizontal: 0,
      paddingTop: 0,
      paddingBottom: 0,
    })
    expect(singleStyles.input.lineHeight).toBe(Platform.OS === 'ios' ? undefined : token.lineHeight)
    expect(singleStyles.singleContent.minHeight).toBe(
      Platform.OS === 'ios' ? token.lineHeight : undefined,
    )
    expect(textareaStyles.shell.paddingHorizontal).toBe(textareaMetrics.paddingHorizontal)
    expect(textareaStyles.textareaShell.minHeight).toBe(
      textareaMetrics.lineHeight * 2 + textareaMetrics.paddingVertical * 2,
    )
    expect(textareaStyles.textareaInput.minHeight).toBe(
      textareaMetrics.lineHeight * 2 + textareaMetrics.paddingVertical * 2,
    )
    expect(textareaStyles.input.lineHeight).toBe(textareaMetrics.lineHeight)
    expect(textareaStyles.input.paddingTop).toBe(textareaMetrics.paddingVertical)
    expect(textareaStyles.input.paddingBottom).toBe(textareaMetrics.paddingVertical)
  })

  it('keeps component metric overrides in the layout source of truth', () => {
    const token = {
      ...getInputToken(getDesignToken()),
      lineHeight: 28,
      paddingHorizontal: 20,
      paddingVertical: 12,
    }
    const state = { focused: false, disabled: false }
    const standaloneStyles = getInputStyles(token, {}, state)
    const embeddedStyles = getInputStyles(token, {}, state, true)

    expect(standaloneStyles.shell.paddingHorizontal).toBe(20)
    expect(standaloneStyles.singleShell.paddingVertical).toBe(12)
    expect(standaloneStyles.singleContent.minHeight).toBe(Platform.OS === 'ios' ? 28 : undefined)
    expect(standaloneStyles.input.lineHeight).toBe(Platform.OS === 'ios' ? undefined : 28)
    expect(embeddedStyles.shell.paddingHorizontal).toBe(0)
    expect(embeddedStyles.singleShell.paddingVertical).toBe(0)
    expect(embeddedStyles.input.fontSize).toBe(token.fontSize)

    const baseToken = getInputToken(getDesignToken())
    const baseTextareaStyles = getInputStyles(baseToken, { multiline: true, rows: 1 }, state)
    const changedTextareaStyles = getInputStyles(token, { multiline: true, rows: 1 }, state)
    expect(changedTextareaStyles.input.lineHeight).toBe(baseTextareaStyles.input.lineHeight)
    expect(changedTextareaStyles.shell.paddingHorizontal).toBe(
      baseTextareaStyles.shell.paddingHorizontal,
    )
    expect(changedTextareaStyles.input.paddingTop).toBe(baseTextareaStyles.input.paddingTop)
    expect(changedTextareaStyles.textareaShell.minHeight).toBe(
      baseTextareaStyles.textareaShell.minHeight,
    )
  })

  it('keeps textarea line height and padding on the multiline path', () => {
    const token = getInputToken(getDesignToken())
    const textareaMetrics = getTextareaMetrics(token, 'normal')
    const textareaStyles = getInputStyles(
      token,
      { multiline: true, size: 'normal' },
      { focused: false, disabled: false },
    )

    expect(textareaStyles.input).toMatchObject({
      lineHeight: textareaMetrics.lineHeight,
      paddingTop: textareaMetrics.paddingVertical,
    })
  })

  it('sizes fixed textarea rows from line height and padding', () => {
    const token = getInputToken(getDesignToken())
    const state = { focused: false, disabled: false }
    const normalStyles = getInputStyles(token, { multiline: true, rows: 2 }, state)
    const smallStyles = getInputStyles(token, { multiline: true, rows: 2, size: 'small' }, state)
    const largeStyles = getInputStyles(token, { multiline: true, rows: 2, size: 'large' }, state)
    const normalMetrics = getTextareaMetrics(token, 'normal')
    const smallMetrics = getTextareaMetrics(token, 'small')
    const largeMetrics = getTextareaMetrics(token, 'large')

    const expectedNormalHeight = normalMetrics.lineHeight * 2 + normalMetrics.paddingVertical * 2
    expect(normalStyles.textareaShell.minHeight).toBe(expectedNormalHeight)
    expect(normalStyles.textareaInput.minHeight).toBe(expectedNormalHeight)
    expect(smallStyles.textareaShell.minHeight).toBe(
      smallMetrics.lineHeight * 2 + smallMetrics.paddingVertical * 2,
    )
    expect(largeStyles.textareaShell.minHeight).toBe(
      largeMetrics.lineHeight * 2 + largeMetrics.paddingVertical * 2,
    )

    const wordLimitStyles = getInputStyles(
      token,
      { multiline: true, rows: 2, showWordLimit: true, maxLength: 20 },
      state,
    )
    expect(wordLimitStyles.textareaShell.minHeight).toBe(
      expectedNormalHeight + smallMetrics.lineHeight + normalMetrics.paddingVertical,
    )
  })

  it('can keep a bordered textarea on its normal border color while focused', async () => {
    const token = getInputToken(getDesignToken())
    const defaultFocusedStyle = getInputStyles(
      token,
      { bordered: true, multiline: true },
      { focused: true, disabled: false },
    )
    const focusedStyle = getInputStyles(
      token,
      { bordered: true, activeBordered: false, multiline: true },
      { focused: true, disabled: false },
    )

    expect(defaultFocusedStyle.shell.borderColor).toBe(token.activeBorderColor)
    expect(focusedStyle.shell).toMatchObject({
      borderColor: token.borderColor,
      borderWidth: token.borderWidth,
    })
  })

  it('uses a separate unconstrained TextInput for autoSize measurement', async () => {
    await render(
      <Input
        testID="stable-auto-size"
        multiline
        autoSize={{ minRows: 1, maxRows: 5 }}
        defaultValue="x"
      />,
    )

    const input = screen.getByTestId('stable-auto-size')
    const measurementInput = getMeasurementInput('stable-auto-size')
    const measurementStyle = StyleSheet.flatten(measurementInput.props.style)
    expect(input.props.numberOfLines).toBeUndefined()
    expect(measurementInput.props.multiline).toBe(true)
    expect(measurementInput.props.editable).toBe(false)
    expect(measurementInput.props.scrollEnabled).toBe(false)
    expect(measurementInput.props.pointerEvents).toBe('none')
    expect(measurementInput.props.accessible).toBe(false)
    expect(measurementInput.props.importantForAccessibility).toBe('no-hide-descendants')
    expect(getInputStyle('stable-auto-size')).toMatchObject({ height: 36 })
    expect(measurementStyle).toMatchObject({
      opacity: 0,
      position: 'absolute',
    })
    expect(measurementStyle.height).toBeUndefined()
    expect(measurementStyle.minHeight).toBeUndefined()
    expect(measurementStyle.maxHeight).toBeUndefined()

    for (const height of [40, 40, 40]) {
      // eslint-disable-next-line testing-library/no-await-sync-events
      await fireEvent(measurementInput, 'contentSizeChange', {
        nativeEvent: { contentSize: { width: 200, height } },
      })
    }

    await waitFor(() => expect(getInputStyle('stable-auto-size').height).toBe(40))
    expect(getInputStyle('stable-auto-size')).toMatchObject({ minHeight: 36, maxHeight: 116 })
  })

  it('keeps an empty autoSize input at minHeight', async () => {
    await render(<Input testID="empty-auto-size" multiline autoSize={{ minRows: 1, maxRows: 5 }} />)

    const measurementInput = getMeasurementInput('empty-auto-size')
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent(measurementInput, 'contentSizeChange', {
      nativeEvent: { contentSize: { width: 200, height: 200 } },
    })

    // Empty values ignore placeholder/native noise and return to the one-line bound.
    expect(getInputStyle('empty-auto-size')).toMatchObject({ height: 36, minHeight: 36 })
  })

  it('clamps measured content to minHeight and grows without re-adding padding', async () => {
    await render(
      <Input
        testID="growing-auto-size"
        multiline
        autoSize={{ minRows: 1, maxRows: 5 }}
        defaultValue="x"
      />,
    )

    const measurementInput = getMeasurementInput('growing-auto-size')
    for (const [height, expected] of [
      [20, 36],
      [40, 40],
      [60, 60],
    ]) {
      // eslint-disable-next-line testing-library/no-await-sync-events
      await fireEvent(measurementInput, 'contentSizeChange', {
        nativeEvent: { contentSize: { width: 200, height } },
      })
      await waitFor(() => expect(getInputStyle('growing-auto-size').height).toBe(expected))
    }
  })

  it('keeps visible contentSizeChange as a public callback only', async () => {
    const onContentSizeChange = jest.fn()

    await render(
      <Input
        testID="auto-size-input"
        multiline
        autoSize={{ minRows: 1, maxRows: 5 }}
        defaultValue="x"
        onContentSizeChange={onContentSizeChange}
      />,
    )

    const input = screen.getByTestId('auto-size-input')
    const measurementInput = getMeasurementInput('auto-size-input')
    const event = {
      nativeEvent: { contentSize: { width: 200, height: 40 } },
    }
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent(input, 'contentSizeChange', event)

    expect(onContentSizeChange).toHaveBeenCalledWith(event)
    expect(getInputStyle('auto-size-input').height).toBe(36)
    expect(screen.getByTestId('auto-size-input').props.scrollEnabled).toBe(false)

    // Only the hidden measurement node is allowed to update autoSize height.
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent(measurementInput, 'contentSizeChange', event)
    await waitFor(() => expect(getInputStyle('auto-size-input').height).toBe(40))
  })

  it('clamps autoSize to maxRows and enables native scrolling', async () => {
    await render(
      <Input
        testID="clamped-auto-size"
        multiline
        autoSize={{ minRows: 1, maxRows: 3 }}
        defaultValue="x"
      />,
    )

    const measurementInput = getMeasurementInput('clamped-auto-size')
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent(measurementInput, 'contentSizeChange', {
      nativeEvent: { contentSize: { width: 200, height: 100 } },
    })

    await waitFor(() => expect(getInputStyle('clamped-auto-size').height).toBe(76))
    expect(screen.getByTestId('clamped-auto-size').props.scrollEnabled).toBe(true)
  })

  it('shrinks when content size decreases', async () => {
    await render(
      <Input
        testID="shrinking-auto-size"
        multiline
        autoSize={{ minRows: 1, maxRows: 5 }}
        defaultValue="x"
      />,
    )

    const measurementInput = getMeasurementInput('shrinking-auto-size')
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent(measurementInput, 'contentSizeChange', {
      nativeEvent: { contentSize: { width: 200, height: 200 } },
    })
    await waitFor(() => expect(getInputStyle('shrinking-auto-size').height).toBe(116))

    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent(measurementInput, 'contentSizeChange', {
      nativeEvent: { contentSize: { width: 200, height: 20 } },
    })
    await waitFor(() => expect(getInputStyle('shrinking-auto-size').height).toBe(36))
    expect(screen.getByTestId('shrinking-auto-size').props.scrollEnabled).toBe(false)
  })

  it('clears the measured height before retyping after a long value is cleared', async () => {
    function ControlledAutoSizeInput() {
      const [value, setValue] = useState('long value')

      return (
        <Input
          testID="clear-and-retype-auto-size"
          multiline
          autoSize={{ minRows: 1, maxRows: 5 }}
          onChangeText={setValue}
          value={value}
        />
      )
    }

    await render(<ControlledAutoSizeInput />)

    const input = screen.getByTestId('clear-and-retype-auto-size')
    const measurementInput = getMeasurementInput('clear-and-retype-auto-size')
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent(measurementInput, 'contentSizeChange', {
      nativeEvent: { contentSize: { width: 200, height: 200 } },
    })
    await waitFor(() => expect(getInputStyle('clear-and-retype-auto-size').height).toBe(116))

    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.changeText(input, '')
    await waitFor(() => expect(getInputStyle('clear-and-retype-auto-size').height).toBe(36))

    // Retyping must wait for a fresh native measurement instead of restoring 116.
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.changeText(input, 'x')
    expect(getInputStyle('clear-and-retype-auto-size').height).toBe(36)

    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent(measurementInput, 'contentSizeChange', {
      nativeEvent: { contentSize: { width: 200, height: 40 } },
    })
    await waitFor(() => expect(getInputStyle('clear-and-retype-auto-size').height).toBe(40))
  })

  it('reserves word limit space and hides clear for multiline input', async () => {
    await render(
      <Input
        testID="word-limit-auto-size"
        multiline
        autoSize
        clearable
        defaultValue="hello"
        showWordLimit
        maxLength={500}
      />,
    )

    const input = screen.getByTestId('word-limit-auto-size')
    const measurementInput = getMeasurementInput('word-limit-auto-size')
    const inputStyle = StyleSheet.flatten(input.props.style)
    expect(inputStyle.paddingBottom).toBeGreaterThan(inputStyle.paddingTop)
    expect(inputStyle.paddingBottom).toBe(34)
    expect(screen.getByText('5/500')).toBeTruthy()
    expect(screen.queryByLabelText('清除输入')).toBeNull()
    expect(StyleSheet.flatten(screen.getByText('5/500').props.style)).toMatchObject({
      position: 'absolute',
      right: expect.any(Number),
      bottom: expect.any(Number),
    })
    expect(StyleSheet.flatten(screen.getByText('5/500').props.style).right).toBeGreaterThan(0)
    expect(StyleSheet.flatten(screen.getByText('5/500').props.style).bottom).toBeGreaterThan(0)

    // The native measurement is clamped to the bound that already includes the
    // word-limit area; the reserve is not added a second time.
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent(measurementInput, 'contentSizeChange', {
      nativeEvent: { contentSize: { width: 200, height: 200 } },
    })
    await waitFor(() => expect(getInputStyle('word-limit-auto-size').height).toBe(142))
    expect(input.props.scrollEnabled).toBe(true)
  })

  it('does not let visible content-size feedback change autoSize height', async () => {
    await render(
      <Input
        testID="feedback-loop-auto-size"
        multiline
        autoSize={{ minRows: 1, maxRows: 5 }}
        defaultValue="x"
      />,
    )

    const input = screen.getByTestId('feedback-loop-auto-size')
    const measurementInput = getMeasurementInput('feedback-loop-auto-size')

    for (const height of [44, 45, 44, 45]) {
      // eslint-disable-next-line testing-library/no-await-sync-events
      await fireEvent(input, 'contentSizeChange', {
        nativeEvent: { contentSize: { width: 200, height } },
      })
    }
    expect(getInputStyle('feedback-loop-auto-size').height).toBe(36)

    // The same value from the measurement node is the only event that updates it.
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent(measurementInput, 'contentSizeChange', {
      nativeEvent: { contentSize: { width: 200, height: 44 } },
    })
    await waitFor(() => expect(getInputStyle('feedback-loop-auto-size').height).toBe(44))
  })

  it('supports uncontrolled values and preserves native and string change handlers', async () => {
    const onChange = jest.fn()
    const onChangeText = jest.fn()

    await render(
      <ConfigProvider>
        <Input testID="input" onChange={onChange} onChangeText={onChangeText} />
      </ConfigProvider>,
    )

    // RNTL's TextInput update is flushed asynchronously under React 19.
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.changeText(screen.getByTestId('input'), 'hello')

    expect(onChangeText).toHaveBeenLastCalledWith('hello')
    await waitFor(() => expect(screen.getByTestId('input').props.value).toBe('hello'))

    // `onChange` remains the native event callback and is not replaced by the string callback.
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent(screen.getByTestId('input'), 'change', {
      nativeEvent: { text: 'hello' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ nativeEvent: { text: 'hello' } }),
    )
  })

  it('keeps number input as a string and selects the numeric keyboard', async () => {
    const onChangeText = jest.fn()

    await render(
      <Input testID="number-input" type="number" defaultValue="001" onChangeText={onChangeText} />,
    )

    const input = screen.getByTestId('number-input')
    expect(input.props.value).toBe('001')
    expect(input.props.keyboardType).toBe('numeric')

    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.changeText(input, '0010')
    expect(onChangeText).toHaveBeenLastCalledWith('0010')
    await waitFor(() => expect(screen.getByTestId('number-input').props.value).toBe('0010'))
  })

  it('maps tel, disabled and readOnly input modes', async () => {
    await render(
      <ConfigProvider>
        <Input testID="tel-input" type="tel" />
        <Input testID="disabled-input" disabled defaultValue="fixed" />
        <Input testID="readonly-input" readOnly defaultValue="readonly" />
      </ConfigProvider>,
    )

    expect(screen.getByTestId('tel-input').props.keyboardType).toBe('phone-pad')
    expect(screen.getByTestId('disabled-input').props.editable).toBe(false)
    expect(screen.getByTestId('readonly-input').props.editable).toBe(false)
  })

  it('formats values before the string change callback', async () => {
    const onChangeText = jest.fn()

    await render(
      <Input
        testID="formatted-input"
        formatter={(value) => value.toUpperCase()}
        onChangeText={onChangeText}
      />,
    )

    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.changeText(screen.getByTestId('formatted-input'), 'abc')
    expect(onChangeText).toHaveBeenLastCalledWith('ABC')
    await waitFor(() => expect(screen.getByTestId('formatted-input').props.value).toBe('ABC'))
  })

  it('formats on end editing without mutating the native event', async () => {
    const onChangeText = jest.fn()
    const onEndEditing = jest.fn()
    const event = { nativeEvent: { text: '  abc  ' } }

    await render(
      <Input
        testID="end-editing-input"
        defaultValue="  abc  "
        formatter={(value) => value.trim()}
        formatTrigger="onEndEditing"
        onChangeText={onChangeText}
        onEndEditing={onEndEditing}
      />,
    )

    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent(screen.getByTestId('end-editing-input'), 'endEditing', event)

    expect(onChangeText).toHaveBeenCalledTimes(1)
    expect(onChangeText).toHaveBeenCalledWith('abc')
    expect(onEndEditing).toHaveBeenCalledTimes(1)
    expect(onEndEditing.mock.calls[0][0].nativeEvent.text).toBe('  abc  ')
    await waitFor(() => expect(screen.getByTestId('end-editing-input').props.value).toBe('abc'))
  })

  it('writes back an end editing formatter result in controlled mode', async () => {
    function ControlledInput() {
      const [value, setValue] = useState('  abc  ')

      return (
        <Input
          testID="controlled-end-editing-input"
          formatter={(nextValue) => nextValue.trim()}
          formatTrigger="onEndEditing"
          onChangeText={setValue}
          value={value}
        />
      )
    }

    await render(<ControlledInput />)
    const event = { nativeEvent: { text: '  abc  ' } }

    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent(screen.getByTestId('controlled-end-editing-input'), 'endEditing', event)

    await waitFor(() =>
      expect(screen.getByTestId('controlled-end-editing-input').props.value).toBe('abc'),
    )
  })

  it('calls onChangeText once when an end editing formatter keeps the same text', async () => {
    const onChangeText = jest.fn()

    await render(
      <Input
        testID="same-end-editing-input"
        defaultValue="abc"
        formatter={(value) => value}
        formatTrigger="onEndEditing"
        onChangeText={onChangeText}
      />,
    )

    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent(screen.getByTestId('same-end-editing-input'), 'endEditing', {
      nativeEvent: { text: 'abc' },
    })

    expect(onChangeText).toHaveBeenCalledTimes(1)
    expect(onChangeText).toHaveBeenCalledWith('abc')
  })

  it('supports focus-triggered clearing and reports onClear once', async () => {
    const onClear = jest.fn()
    const onChangeText = jest.fn()

    await render(
      <Input
        testID="clear-input"
        defaultValue="hello"
        clearable
        onClear={onClear}
        onChangeText={onChangeText}
      />,
    )

    const clearButton = screen.getByLabelText('清除输入')
    expect(clearButton.props.pointerEvents).toBe('none')
    expect(StyleSheet.flatten(clearButton.props.style)).toMatchObject({
      opacity: 0,
      width: 0,
      marginLeft: 0,
    })
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent(screen.getByTestId('clear-input'), 'focus')
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.press(screen.getByLabelText('清除输入'))

    expect(onClear).toHaveBeenCalledTimes(1)
    expect(onChangeText).toHaveBeenLastCalledWith('')
    await waitFor(() => expect(screen.getByTestId('clear-input').props.value).toBe(''))
  })

  it('keeps an always-visible clear button clickable before focus', async () => {
    const onClear = jest.fn()

    await render(
      <Input
        testID="always-clear-input"
        defaultValue="hello"
        clearable
        clearTrigger="always"
        onClear={onClear}
      />,
    )

    const clearButton = screen.getByLabelText('清除输入')
    expect(clearButton.props.pointerEvents).toBe('auto')
    fireEvent.press(clearButton)

    expect(onClear).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.getByTestId('always-clear-input').props.value).toBe(''))
  })

  it('keeps the clear node mounted but ignores a hidden clear press', async () => {
    const onClear = jest.fn()

    await render(
      <Input testID="hidden-clear-input" defaultValue="hello" clearable onClear={onClear} />,
    )

    const clearButton = screen.getByLabelText('清除输入')
    expect(clearButton.props.pointerEvents).toBe('none')
    fireEvent.press(clearButton)

    expect(onClear).not.toHaveBeenCalled()
    expect(screen.getByTestId('hidden-clear-input').props.value).toBe('hello')
  })

  it('toggles uncontrolled and controlled password visibility', async () => {
    const onPasswordVisibleChange = jest.fn()

    await render(
      <ConfigProvider>
        <Input testID="password-input" type="password" defaultValue="secret" />
      </ConfigProvider>,
    )

    const passwordInput = screen.getByTestId('password-input')
    expect(passwordInput.props.secureTextEntry).toBe(true)
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.press(screen.getByLabelText('显示密码'))
    expect(screen.getByTestId('password-input').props.secureTextEntry).toBe(false)
    expect(screen.getByLabelText('隐藏密码')).toBeTruthy()

    await render(
      <Input
        testID="controlled-password"
        type="password"
        passwordVisible={false}
        onPasswordVisibleChange={onPasswordVisibleChange}
      />,
    )
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.press(screen.getByLabelText('显示密码'))
    expect(onPasswordVisibleChange).toHaveBeenLastCalledWith(true)
    expect(screen.getByTestId('controlled-password').props.secureTextEntry).toBe(true)
  })

  it('uses component tokens for password toggle layout', async () => {
    await render(
      <ConfigProvider theme={{ components: { Input: { paddingVertical: 10 } } }}>
        <Input testID="token-input" type="password" />
      </ConfigProvider>,
    )

    const toggle = screen.getByLabelText('显示密码')
    const toggleStyle = StyleSheet.flatten(toggle.props.style)
    expect(toggleStyle.height).toBe(toggleStyle.width)
    expect(toggle.props.hitSlop).toBe(8)
  })
})
