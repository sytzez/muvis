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
    onChange: (e) => dispatch({ type: 'SET_COLOR_MODE', mode: e.target.value }),
  });

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(Select)
})();