'use strict';

const brushShapes = Object.freeze({
  RECT: '1',
  CIRCLE: '2',
  TRIANGLE: '3',
});

const brushColorModes = Object.freeze({
  UNIFORM: 'UNIFORM',
  VOICE: 'VOICE',
  PITCH: 'PITCH',
});

const brushPlayModes = Object.freeze({
  MASK: '1', // color changes at current point
  FLIP: '2', // whole note flips color at once
  ON_OFF: '3', // flips color when played and flip back
  FLASH: '4', // flip color and slowly change back
});

const brushTemplate = Object.freeze({
  id: 0,
  name: 'BRush 1',
  type: 0, // idk
  noteColor: noteColors.RED,

  timeZoom: 1.0, // relative zoom on time axis
  timeCurve1: 0.3, // curvature around center
  timeCurve2: 5.0,

  shape: brushShapes.RECT,
  playMode: brushPlayModes.FLASH,
  colorMode: brushColorModes.UNIFORM,
  size: 1.0, // size of the notes
  sizeCurve: 0.0, // size change when being played
  leftColor: [0,0,1], // before being played
  rightColor: [1,1,1], // after being played
});

const maxBrushes = 32;
var brushIdCounter = 0;

const brushes = (state, action) => {
  switch(action.type) {
    case 'NEW_BRUSH':
      if (state.length >= maxBrushes) return state;

      return [ ...state, {
        ...brushTemplate,
        ...action.brush,
        id:  brushIdCounter++,
        noteColor: getNextBrushColor(state),
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
          name: state[action.id].name + ' copy',
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