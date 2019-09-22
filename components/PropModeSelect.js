const PropModeSelect = (() => {
  'use strict';

  const mapStateToProps = state => ({
    options: [
      { value: propModes.PIECE, text: 'Piece' },
      { value: propModes.BRUSH, text: 'Brush' },
      { value: propModes.VOICE, text: 'Voice' },
    ],
    selected: state.propMode,
  });

  const mapDispatchToProps = dispatch => ({
    change: (val) => dispatch({ type: 'SET_PROP_MODE', mode: val }),
  });

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(Select)
})();