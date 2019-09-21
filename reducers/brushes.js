'use strict';

const brushDesign = {
  id: 0,
  name: 'BRush 1',
  type: 0, // idk
  noteColor: noteColors.RED,

  timeZoom: 1, // relative zoom on time axis
};

const maxBrushes = 32;
var brushIdCounter = 0;

const brushes = (state, action) => {
  switch(action.type) {
    case 'NEW_BRUSH':
      if (state.length >= maxBrushes) return state;

      return [ ...state, {
        ...action.brush,
        id:  brushIdCounter++,
        noteColor: getNextBrushColor(state),
        
        timeZoom: 1,
       } ];
    case 'REMOVE_BRUSH':
      return state.filter(b => b.id !== action.id);
    case 'UPDATE_BRUSH':
      return state.map(b =>
        b.id === action.id ? { ...b, ...action.brush } : b
      );
    case 'CLONE_BRUSH':
      if (state.length >= maxBrushes) return state;

      const index = state.findIndex(b => b.id === action.id) + 1;

      return [
        ...state.slice(0, index),
        {
          ...state[action.id],
          id: brushIdCounter++,
          noteColor: getNextBrushColor(state),
        },
        ...state.slice(index),
      ];
    default:
      return state;
  }
};

const getBrushById = (state, id) => {
  for(let i = 0; i < state.length; i++)
    if (state[i].id === id) return state[i];
  return null;
};

const getNextBrushColor = (state) => {
  const colors = {}
  colors[noteColors.RED] = 0;
  colors[noteColors.TURQOISE] = 0;
  colors[noteColors.YELLOW] = 0;
  colors[noteColors.BLUE] = 0;

  state.forEach(b => colors[b.noteColor]++);

  let min = Number.MAX_SAFE_INTEGER;
  let color = noteColors.RED;
  Object.keys(colors).forEach(c => {
    if (colors[c] < min) {
      color = c;
      min = colors[c];
    }
  })
  
  return color;
};