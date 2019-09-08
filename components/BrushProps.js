const BrushProps = (() => {
  'use strict'

  const e = React.createElement;

  const BrushProps = ({}) => e('div', {}, [
    'Brush:',
    'note coloer',
    'type (shape, flow)',
    'size',
    'color by brush or by voice',
    'brush color', // if color by brush
    'movement curve',
    'masking when out of view',
    'relative speed relative to other voices',
  ]);

  const mapStateToProps = state => ({

  });

  return ReactRedux.connect(
    mapStateToProps,
  )(BrushProps);
})();