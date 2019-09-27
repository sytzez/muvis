'use strict';

// type, stacks, description
const historyActions = Object.freeze(new Map([
  ['INSERT_NOTE', true, 'insert note'],
  ['INSERT_NOTES', false, 'insert notes'],
  ['UPDATE_NOTE', true, 'edit note'],
  ['LOAD_STATE', false, 'load project'],
  // TODO finish list
]));

const history = (state, action) => {
  const history = state.history;

  if (historyActions.get(action.type) !== undefined) {
    // TODO stack
    let past = history.past;
    if (past.length > 10) past = past.slice(-10);

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
  notes: state.notes,
  voices: state.voices,
  brushes: state.brushes,
  tempo: state.tempo,
  // TODO other properties
});