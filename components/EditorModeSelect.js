const EditorModeSelect = (() => {
  'use strict';

  const mapStateToProps = state => ({
    options: [
      { value: editorModes.FILES, text: 'File' },
      { value: editorModes.NOTES, text: 'Note editor' },
      { value: editorModes.TEMPO, text: 'Time syncher' },
      // { value: editorModes.YOUTUBE, text: 'Video' },
      { value: editorModes.VISUAL, text: 'Preview' },
    ],
    selected: state.editorMode,
  });

  const mapDispatchToProps = dispatch => ({
    change: (val) => dispatch({ type: 'SET_EDITOR_MODE', mode: val }),
  });

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(Select)
})();