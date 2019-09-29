const BrushProps = (() => {
  'use strict';

  const e = React.createElement;

  const BrushProps = ({
    id, available,
    name, changeName,
    shape, changeShape,
    brushColor, changeBrushColor,
    colorMode, changeColorMode,
    playMode, changePlayMode,
    timeZoom, changeTimeZoom,
    timeCurve1, changeTimeCurve1, timeCurve2, changeTimeCurve2,
  }) => available ?
    e('div', {}, [

      e(StringInput, {
        value: name,
        change: (val) => changeName(id, val),
        key: 1,
      }),
      e('hr', {key: 2}),

      'Shape:',
      e(Select, {
        options: [
          { value: brushShapes.RECT, text: 'Rectangle' },
          { value: brushShapes.CIRCLE, text: 'Circle' },
          { value: brushShapes.TRIANGLE, text: 'Triangle' },
        ],
        selected: shape,
        change: (m) => changeShape(id, m),
        key: 10,
      }),
      e(ValueInput, {
        text: 'Size: ',
        min: 0.1,
        max: 10.0,
        value: 0,
        automated: false,
        change: () => false,
        key: 11,
      }),
      e('hr', {key: 12}),

      'Color:',
      e(Select, {
        options: [
          { value: brushColorModes.UNIFORM, text: 'Uniform' },
          { value: brushColorModes.VOICE, text: 'From voice' },
          { value: brushColorModes.PITCH, text: 'From pitch' },
        ],
        selected: colorMode,
        change: (m) => changeColorMode(id, m),
        key: 20,
      }),
      colorMode === brushColorModes.UNIFORM ?
        e(ColorPicker, {
          text: 'Uniform color: ',
          value: brushColor,
          change: (c) => changeBrushColor(id, c),
          key: 21,
        }) : null,
      e('hr', {key: 22}),

      'Light up mode:',
      e(Select, {
        options: [
          { value: brushPlayModes.MASK, text: 'Gradual' },
          { value: brushPlayModes.FLIP, text: 'Flip on' },
          { value: brushPlayModes.ON_OFF, text: 'Flip on/off' },
          { value: brushPlayModes.FLASH, text: 'Flash' },
        ],
        selected: playMode,
        change: (m) => changePlayMode(id, m),
        key: 30,
      }),
      e('hr', {key: 32}),
      
      e(ValueInput, {
        text: 'Relative speed: ',
        min: 0.5,
        max: 2.0,
        value: timeZoom,
        automated: false,
        change: (z) => changeTimeZoom(id, z),
        key: 40,
      }),
      e(ValueInput, {
        text: 'Time curve width: ',
        min: 0.1,
        max: 3.0,
        value: timeCurve1,
        automated: false,
        change: (c) => changeTimeCurve1(id, c),
        key: 41,
      }),
      e(ValueInput, {
        text: 'Time curve intensity: ',
        min: 1.0,
        max: 20.0,
        value: timeCurve2,
        automated: false,
        change: (c) => changeTimeCurve2(id, c),
        key: 42,
      }),

      'size',
      'movement curve',
      'masking when out of view',
      'type (shape, flow)',
      'relative speed relative to other voices',
    ]) : 'No brush selected.';

  const mapStateToProps = state => {
    if (state.selectedBrush === -1) return { available: false };
    const brush = getBrushById(state.brushes, state.selectedBrush);
    return {
      available: true,
      id: state.selectedBrush,
      name: brush.name,
      timeZoom: brush.timeZoom,
      shape: brush.shape,
      brushColor: brush.leftColor,
      colorMode: brush.colorMode,
      playMode: brush.playMode,
      timeCurve1: brush.timeCurve1,
      timeCurve2: brush.timeCurve2,
    };
  };

  const mapDispatchToProps = dispatch => ({
    changeName: (id, val) =>
      dispatch({ type: 'UPDATE_BRUSH', id, brush: { name: val }, click }),
    changeShape: (id, val) =>
      dispatch({ type: 'UPDATE_BRUSH', id, brush: { shape: val }, click }),
    changeTimeZoom: (id, val) =>
      dispatch({ type: 'UPDATE_BRUSH', id, brush: { timeZoom: val }, click }),
    changeBrushColor: (id, val) =>
      dispatch({ type: 'UPDATE_BRUSH', id, brush: { leftColor: val }, click }),
    changeColorMode: (id, val) =>
      dispatch({ type: 'UPDATE_BRUSH', id, brush: { colorMode: val }, click }),
    changePlayMode: (id, val) =>
      dispatch({ type: 'UPDATE_BRUSH', id, brush: { playMode: val }, click }),
    changeTimeCurve1: (id, val) =>
      dispatch({ type: 'UPDATE_BRUSH', id, brush: { timeCurve1: val }, click }),
    changeTimeCurve2: (id, val) =>
      dispatch({ type: 'UPDATE_BRUSH', id, brush: { timeCurve2: val }, click }),
  });

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(BrushProps);
})();