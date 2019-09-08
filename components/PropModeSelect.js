const PropModeSelect = (() => {
  'use strict';

  const mapStateToProps = state => ({
    options: [
      { value: propModes.PIECE, text: 'Piece properties' },
      { value: propModes.BRUSH, text: 'Brush properties' },
      { value: propModes.VOICE, text: 'Voice properties' },
    ],
    selected: state.propMode,
  });

  const mapDispatchToProps = dispatch => ({
    onChange: (e) => dispatch({ type: 'SET_PROP_MODE', mode: e.target.value }),
  });

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(Select)
})();