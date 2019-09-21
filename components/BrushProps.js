const BrushProps = (() => {
  'use strict';

  const e = React.createElement;

  const BrushProps = ({ id, available, timeZoom, changeTimeZoom }) => available ?
    e('div', {}, [
      'Brush:',
      'note coloer',
      'type (shape, flow)',
      e(ValueInput, {
        text: 'Relative speed:',
        min: 0.5,
        max: 2.0,
        value: timeZoom,
        automated: false,
        change: (e) => changeTimeZoom(id, e.target.value),
        key: 0,
      }),
      'size',
      'color by brush or by voice',
      'brush color', // if color by brush
      'movement curve',
      'masking when out of view',
      'relative speed relative to other voices',
    ]) : 'no brush selected';

  const mapStateToProps = state => {
    if (state.selectedBrush === -1) return { available: false };
    const brush = getBrushById(state.brushes, state.selectedBrush);
    return {
      available: true,
      id: state.selectedBrush,
      timeZoom: brush.timeZoom,
    };
  };

  const mapDispatchToProps = dispatch => ({
    changeTimeZoom: (id, val) => dispatch({ type: 'UPDATE_BRUSH', id, brush: { timeZoom: val } }),

  });

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(BrushProps);
})();