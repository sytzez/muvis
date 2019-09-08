'use strict';

const noteDesign = {
  id: 0,
  pitch: 1,
  start: 1,
  length: 1,
  voice: 1, // the voice in the midi data
  brush: -1, // the brush used to render it
};

const noteColors = Object.freeze({
  RED: 'color1',
  TURQOISE: 'color2',
  YELLOW: 'color3',
  BLUE: 'color4',
});

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
      return state.map(n => n.id === action.id ? { ...n, ...action.note } : n);
    case 'UPDATE_NOTES':
      return state.map(n => {
        const index = action.ids.indexOf(n.id);
        if (index !== -1) {
          return { ...n, ...action.notes[id] };
        } else {
          return n;
        }
      });
    case 'PAINT_NOTE':
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
      return [ ...action.ids ];
    case 'SHIFT_SELECT_NOTE':
      return state.includes(action.id) ? state :
        [ ...state, action.id ];
    case 'SHIFT_DESELECT_NOTE':
      return state.filter(id => id !== action.id);
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