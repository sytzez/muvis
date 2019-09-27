const VoiceList = (() => {
  'use strict';

  const e = React.createElement;

  const VoiceList = props => {
    const {
      onNew, active,
      paintable, onPaint, onStopPaint,
      seen, onSee,
    } = props;

    return e('div', { 
      className: active ? 'active' : '',
    }, [
      'Voices:',
      e('button', {onClick: onNew, key: 1}, 'New'),
      paintable ? e('button', {
        className: active ? 'selected' : '',
        onClick: active ? onStopPaint : onPaint,
        key: 2,
      }, 'Paint') : null,
      paintable ? e('button', {
        className: seen ? 'selected' : '',
        onClick: onSee,
        key: 3,
      }, 'See') : null,
      e(List, {...props, key: 0}),
    ]);
  };

  const mapStateToProps = state => ({
    checkable: true,
    removable: false,
    cloneable: false,
    items: state.voices.map((v, i) => ({
      value: i,
      name: 'Voice ' + (i + 1),
      color: v.noteColor,
    })),
    checked: state.visibleVoices,
    selected: state.selectedVoice,
    active: state.editorMode === editorModes.NOTES &&
      state.editMode === editModes.VOICES,
    paintable: state.editorMode === editorModes.NOTES,
    seen: state.editorMode === editorModes.NOTES &&
      state.colorMode === colorModes.VOICE,
  });

  const mapDispatchToProps = dispatch => ({
    onSelect: (id) => dispatch({ type: 'SELECT_VOICE', id: id }),
    onCheck: (id) => dispatch({ type: 'SHOW_HIDE_VOICE', id: id }),
    onSolo: (id) => dispatch({ type: 'SHOW_ONLY_VOICE', id: id }),
    onNew: () => dispatch({ type: 'NEW_VOICE' }),
    onPaint: () =>
      dispatch({ type: 'SET_EDIT_MODE', mode: editModes.VOICES }),
    onStopPaint: () =>
      dispatch({ type: 'SET_EDIT_MODE', mode: editModes.NOTES }),
    onSee: () =>
      dispatch({ type: 'SET_COLOR_MODE', mode: colorModes.VOICE }),
  });

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(VoiceList);
})();