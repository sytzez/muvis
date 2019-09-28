const PieceProps = (() => {
  'use strict'

  const e = React.createElement;

  const PieceProps = ({
    background, setBackground,
    timeSpan, setTimeSpan,
    pitchTop, setPitchTop, pitchBottom, setPitchBottom,
  }) => e('div', {}, [
    'Piece:',
    'Title',
    'Tempo', // initial, show if there is automation
    e(ColorPicker, {
      text: 'Background:',
      value: background,
      change: setBackground,
      key: 100,
    }),
    e('hr', {key: 101}),

    'Span of the screen:',
    e(ValueInput, { // TODO: time formatting 00:00:00
      text: 'Time: ',
      min: 0.1,
      max: 60.0,
      value: timeSpan,
      automated: false,
      change: setTimeSpan,
      key: 110,
    }),
    e(ValueInput, { // TODO: note formatting
      text: 'Highest pitch: ',
      min: 0,
      max: 127,
      value: pitchTop,
      automated: false,
      change: setPitchTop,
      key: 111,
    }),
    e(ValueInput, { // TODO: note formatting
      text: 'Lowest pitch: ',
      min: 0,
      max: 127,
      value: pitchBottom,
      automated: false,
      change: setPitchBottom,
      key: 112,
    }),
    e('hr', {key: 119}),
  ]);

  const mapStateToProps = state => ({
    background: state.backgroundColor,
    timeSpan: state.timeSpan,
    pitchTop: state.pitchTop,
    pitchBottom: state.pitchBottom,
  });

  const mapDispatchToProps = dispatch => ({
    setBackground: (col) =>
      dispatch({ type: 'UPDATE_PROPS', props: { backgroundColor: col } }),
    setTimeSpan: (val) =>
      dispatch({ type: 'UPDATE_PROPS', props: { timeSpan: val } }),
    setPitchTop: (pitch) =>
      dispatch({ type: 'SET_PITCH_TOP', pitch }),
    setPitchBottom: (pitch) =>
      dispatch({ type: 'SET_PITCH_BOTTOM', pitch }),
  })

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(PieceProps);
})();