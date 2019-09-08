const NoteViewContainer = (() => {
  'use strict';

  const NoteViewContainer = props => React.createElement(NoteView, props);

  const mapStateToProps = state => {
    const filteredNotes = getVisibleNotes(state);
    return {
      notes: filteredNotes, // changeable visibility? (brush...voice)
      ghosts: state.notes.filter(n => !filteredNotes.includes(n)),
      brushes: state.brushes,
      voices: state.voices,
      selected: state.selectedNotes,
      scaleX: state.scaleX,
      scaleY: state.scaleY,
      editMode: state.editMode,
      colorMode: state.colorMode,
      brush: state.selectedBrush,
      voice: state.selectedVoice,
    };
  };

  const mapDispatchToProps = dispatch => ({
    insertNote: (note) => dispatch({ type: 'INSERT_NOTE', note }),
    updateNote: (id, note) => dispatch({ type: 'UPDATE_NOTE', id, note }),
    selectNote: (id) => dispatch({ type: 'SELECT_NOTE', id }),
    shiftSelectNote: (id) => dispatch({ type: 'SHIFT_SELECT_NOTE', id }),
    shiftDeselectNote: (id) => dispatch({ type: 'SHIFT_DESELECT_NOTE', id }),
    deselectAllNotes: () => dispatch({ type: 'DESELECT_ALL_NOTES' }),
    paintNote: (id, brushId) => dispatch({ type: 'PAINT_NOTE', id, brushId }),
    voiceNote: (id, voiceId) => dispatch({ type: 'VOICE_NOTE', id, voiceId }),
    removeNote: (id) => dispatch({ type: 'REMOVE_NOTE', id }),
  });

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(NoteViewContainer);
})();