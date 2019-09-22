const EditModeSelect = (() => {
  'use strict';

  const mapStateToProps = state => ({
    options: [
      { value: editModes.NOTES, text: 'Note edit mode' },
      { value: editModes.PAINT, text: 'Paint mode' },
      { value: editModes.VOICES, text: 'Voice assign mode' },
      { value: editModes.VISUAL, text: 'Visual mode' },
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