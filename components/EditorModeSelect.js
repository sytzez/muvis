const EditorModeSelect = (() => {
  'use strict';

  const mapStateToProps = state => ({
    options: [
      { value: editorModes.FILES, text: 'Files' },
      { value: editorModes.NOTES, text: 'Note editor' },
      { value: editorModes.TEMPO, text: 'Time editor' },
      { value: editorModes.VISUAL, text: 'Preview' },
      { value: editorModes.YOUTUBE, text: 'Video' },
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