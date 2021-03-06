'use strict';

// increases every mouseclick, to trace which events belong together
let click = 0;

const historyActions = Object.freeze(new Set([
  'INSERT_NOTE', 'INSERT_NOTES', 'REMOVE_NOTE', 'REMOVE_NOTES', 'REMOVE_ALL_NOTES',
  'UPDATE_NOTE', 'UPDATE_NOTES', 'MOVE_NOTE', 'MOVE_NOTES', 'RESIZE_NOTE', 'RESIZE_NOTES',
  'PAINT_NOTE', 'PAINT_NOTES', 'VOICE_NOTE', 'VOICE_NOTES',

  'NEW_BRUSH', 'REMOVE_BRUSH', 'INSERT_BRUSH', 'UPDATE_BRUSH', 'CLONE_BRUSH',

  'NEW_VOICE', 'REMOVE_VOICE', 'INSERT_VOICE', 'UPDATE_VOICE', 'CLONE_VOICE',

  'INSERT_TEMPO_CHANGE', 'REMOVE_TEMPO_CHANGE', 'UPDATE_TEMPO_CHANGE',

  'SET_PITCH_TOP', 'SET_PITCH_BOTTOM', 'UPDATE_PROPS',

  'LOAD_NOTES', 'LOAD_STATE', 'LOAD_EMPTY',
]));

const historyStackableActions = Object.freeze(new Set([
  'REMOVE_NOTE', 'UPDATE_NOTE', 'UPDATE_NOTES',
  'MOVE_NOTE', 'MOVE_NOTES', 'RESIZE_NOTE', 'RESIZE_NOTES',
  'PAINT_NOTE', 'VOICE_NOTE',
  'INSERT_BRUSH', 'UPDATE_BRUSH',
  'INSERT_VOICE', 'UPDATE_VOICE',
  'SET_PITCH_TOP', 'SET_PITCH_BOTTOM', 'UPDATE_PROPS',
  'UPDATE_TEMPO_CHANGE', 'REMOVE_TEMPO_CHANGE',
]));

const historyDepth = 32;

const history = (state, action) => {
  const history = state.history;

  if (historyActions.has(action.type)) {
    let past = history.past;

    if (historyStackableActions.has(action.type) && past.length !== 0) {
      const last = past[past.length - 1];

      if (last.hasOwnProperty('action') && last.action.type === action.type) {
        if (action.hasOwnProperty('click')) {
          if (action.click === last.action.click)
            return history;
        } else {
          if ((action.hasOwnProperty('id') && action.id === last.action.id) ||
            (action.hasOwnProperty('ids') && action.ids === last.action.ids))
            return history;
        }
      }
    }

    if (past.length > historyDepth) past = past.slice(-historyDepth);

    return {
      past: [
        ...history.past,
        historyFromState(state),
      ],
      future: [],
    };
  } else {
    return history;
  }
};

const historyFromState = (state) => ({
  action: state.action,
  notes: state.notes,
  voices: state.voices,
  brushes: state.brushes,
  tempo: state.tempo,
  colorMode: state.colorMode,
  editorMode: state.editorMode,
  editMode: state.editMode,
  propMode: state.propMode,
  selectedBrush: state.selectedBrush,
  selectedVoice: state.selectedVoice,
  selectedNotes: state.selectedNotes,
  visibleVoices: state.visibleVoices,
  visibleBrushes: state.visibleBrushes,
  title: state.title,
  aspectRatio: state.aspectRatio,
  resolution: state.resolution,
  timeSpan: state.timeSpan,
  pitchTop: state.pitchTop,
  pitchBottom: state.pitchBottom,
  backgroundColor: state.backgroundColor,
  ytUrl: state.ytUrl,
});