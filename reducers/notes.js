'use strict';

const noteDesign = {
  id: 0,
  pitch: 1,
  start: 1,
  length: 1,
  voice: 1, // the voice in the midi data
  brush: -1, // the brush used to render it
};

const noteColors = Object.freeze((() => {
  const a = [];
  for(let i = 1; i < 19; i++) {
    a.push(`color${i}`);
  }
  return a;
})());

let noteIdCounter = 0;

const notes = (state, action) => {
  switch(action.type) {
    case 'INSERT_NOTE':
      return [
        ...state,
        { ...action.note, id: noteIdCounter++ },
      ];
    case 'INSERT_NOTES':
      return [
        ...state,
        ...action.notes.map(n => ({
          ...n,
          id: noteIdCounter++,
        })),
      ];
    case 'REMOVE_NOTE':
      return state.filter(n => n.id !== action.id);
    case 'REMOVE_NOTES':
      return state.filter(n => !action.ids.includes(n.id));
    case 'REMOVE_ALL_NOTES':
      return [];
    case 'UPDATE_NOTE':
      // return state.map(n => n.id === action.id ? { ...n, ...action.note } : n);
      return [
        ...state.filter(n => n.id !== action.id),
        { ...getNoteById(state, action.id), ...action.note },
      ];
    case 'UPDATE_NOTES':
      // return state.map(n => {
      //   const index = action.ids.indexOf(n.id);
      //   if (index !== -1) {
      //     return { ...n, ...action.notes[id] };
      //   } else {
      //     return n;
      //   }
      // });
      return state;
    case 'MOVE_NOTES': {
      const notes = getNotesByIds(state, action.ids);
      let time = action.time;
      let pitch = action.pitch;
      // TODO: limit
      return [
        ...state.filter(n => !action.ids.includes(n.id)),
        ...notes.map(n => ({
          ...n,
          start: n.start + time,
          pitch: n.pitch + pitch
        })),
      ];
    } case 'RESIZE_NOTES' : {
      const notes = getNotesByIds(state, action.ids);
      let length = action.length;
      if (length < 0) {
        notes.forEach(n => {
          if (-n.length + 1 > length)
            length = -n.length + 1;
        });
      }
      return [
        ...state.filter(n => !action.ids.includes(n.id)),
        ...notes.map(n => ({
          ...n,
          length: n.length + length,
        })),
      ];
    } case 'PAINT_NOTE':
      return state.map(n => n.id === action.id ? { ...n, brush: action.brushId } : n);
    case 'PAINT_NOTES':
      return state.map(n =>
        action.ids.includes(n.id) ? { ...n, brush: action.brushId } : n);
    case 'REMOVE_BRUSH':
      // reset all notes of that brush to no brush
      return state.map(n =>
        n.brush === action.id ? { ...n, brush: -1 } : n
      );
    case 'VOICE_NOTE':
      return state.map(n => n.id === action.id ? { ...n, voice: action.voiceId } : n);
    case 'VOICE_NOTES':
      return state.map(n =>
        action.ids.includes(n.id) ? { ...n, voice: action.voiceId } : n);
    default:
      return state;
  }
};

const getNotesbyVoice = (state, voice) => state.filter(n => n.voice === voice);

const getNotesbyBrush = (state, brush) => state.filter(n => n.brush === brush);

const getNoteById = (state, id) => {
  for(let i = 0; i < state.length; i++)
    if (state[i].id === id) return state[i];
  return null;
};

const getNotesByIds = (state, ids) => state.filter(n => ids.includes(n.id));

const selectedNotes = (state, action) => {
  switch(action.type) {
    case 'SELECT_NOTE':
      return [ action.id ];
    case 'SELECT_NOTES':
      return action.ids;
    case 'SHIFT_SELECT_NOTE':
      return state.includes(action.id) ?
        state.filter(id => id !== action.id) :
        [ ...state, action.id ];
    case 'SHIFT_SELECT_NOTES':
      return [
        ...state,
        ...action.ids.filter(id => !state.includes(id)), // ignore duplicates
      ];
    case 'DESELECT_NOTES':
      return state.filter(id => !action.ids.includes(id));
    case 'DESELECT_ALL_NOTES':
      return [];
    default:
      return state;
  }
};