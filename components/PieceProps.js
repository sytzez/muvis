const PieceProps = (() => {
  'use strict'

  const e = React.createElement;

  const PieceProps = ({
    title, setTitle,
    background, setBackground,
    timeSpan, setTimeSpan,
    pitchTop, setPitchTop, pitchBottom, setPitchBottom,
  }) => e('div', {}, [

    'Title: ',
    e(StringInput, {
      value: title,
      change: setTitle,
      key: 90,
    }),
    e('hr', {key: 91}),

    e(ColorPicker, {
      text: 'Background: ',
      value: background,
      change: setBackground,
      key: 100,
    }),
    e('hr', {key: 101}),

    e(ResolutionPicker, {
      text: 'Resolution: ',
      key: 105,
    }),
    e('hr', {key: 106}),

    'Span of the screen:', e('br', {key: 109}),
    e(ValueInput, {
      text: 'Width (seconds): ',
      min: 0.1,
      max: 60.0,
      value: timeSpan,
      automated: false,
      change: setTimeSpan,
      key: 110,
    }),
    e(PitchInput, {
      text: 'Highest pitch: ',
      value: pitchTop,
      change: setPitchTop,
      key: 111,
    }),
    e(PitchInput, {
      text: 'Lowest pitch: ',
      value: pitchBottom,
      change: setPitchBottom,
      key: 112,
    }),
    e('hr', {key: 119}),
  ]);

  const mapStateToProps = state => ({
    title: state.title,
    background: state.backgroundColor,
    timeSpan: state.timeSpan,
    pitchTop: state.pitchTop,
    pitchBottom: state.pitchBottom,
  });

  const mapDispatchToProps = dispatch => ({
    setTitle: (title) =>
      dispatch({ type: 'UPDATE_PROPS', props: { title }, click }),
    setBackground: (col) =>
      dispatch({ type: 'UPDATE_PROPS', props: { backgroundColor: col } , click}),
    setTimeSpan: (val) =>
      dispatch({ type: 'UPDATE_PROPS', props: { timeSpan: val }, click }),
    setPitchTop: (pitch) =>
      dispatch({ type: 'SET_PITCH_TOP', pitch, click }),
    setPitchBottom: (pitch) =>
      dispatch({ type: 'SET_PITCH_BOTTOM', pitch, click }),
  })

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(PieceProps);
})();