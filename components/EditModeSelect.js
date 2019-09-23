const EditModeSelect = (() => {
  'use strict';

  const mapStateToProps = state => ({
    options: [
      { value: editModes.NOTES, text: 'Note edit mode' },
      { value: editModes.PAINT, text: 'Brush assign mode' },
      { value: editModes.VOICES, text: 'Voice assign mode' },
    ],
    selected: state.editMode,
  });

  const mapDispatchToProps = dispatch => ({
    change: (val) => dispatch({ type: 'SET_EDIT_MODE', mode: val }),
  });

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(Select)
})();