const ColorModeSelect = (() => {
  'use strict';

  const mapStateToProps = state => ({
    options: [
      { value: colorModes.BRUSH, text: 'Color by brush' },
      { value: colorModes.VOICE, text: 'Color by voice' },
    ],
    selected: state.colorMode,
  });

  const mapDispatchToProps = dispatch => ({
    change: (val) => dispatch({ type: 'SET_COLOR_MODE', mode: val }),
  });

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(Select)
})();