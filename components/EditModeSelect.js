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
    onChange: (e) => dispatch({ type: 'SET_EDIT_MODE', mode: e.target.value }),
  });

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(Select)
})();