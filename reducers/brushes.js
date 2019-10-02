'use strict';

const brushShapes = Object.freeze({
  RECT: '1',
  CIRCLE: '2',
  TRIANGLE: '3',
  BLOB: '4',
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

const brushConnectModes = Object.freeze({
  NONE: '1',
  LINE: '2', // connect through a line
  FLOAT: '3', // float whole note towards next note
  BEND: '4',
});

const brushTemplate = Object.freeze({
  id: 0,
  name: 'Brush 1',
  type: 0, // idk
  noteColor: noteColors[0],

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

  connectMode: brushConnectModes.NONE,
  connectDistance: 0.1,
  appearBack: '1',
});

const maxBrushes = 32;
var brushIdCounter = 1;

const brushes = (state, action) => {
  switch(action.type) {
    case 'NEW_BRUSH':
      if (state.length >= maxBrushes) return state;

      return [ ...state, {
        ...brushTemplate,
        ...action.brush,
        id:  brushIdCounter++,
        name: getNextBrushName(state),
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

      const index = state.findIndex(b => b.id === action.id);

      return [
        ...state.slice(0, index + 1),
        {
          ...state[index],
          id: brushIdCounter++,
          name: state[index].name + ' copy',
          noteColor: getNextBrushColor(state),
        },
        ...state.slice(index + 1),
      ];
    case 'INSERT_BRUSH': {
      const brush = getBrushById(state, action.id);
      if (!brush) return state;

      const removedState = state.filter(b => b.id !== action.id);

      return [
        ...removedState.slice(0, action.index),
        brush,
        ...removedState.slice(action.index),
      ];
    } default:
      return state;
  }
};

const getBrushById = (state, id) => {
  for(let i = 0; i < state.length; i++)
    if (state[i].id === id) return state[i];
  return null;
};

const getNextBrushColor = state => {
  const colors = new Map();

  noteColors.forEach(c => colors.set(c, 0));

  state.forEach(b =>
    colors.set(b.noteColor, colors.get(b.noteColor) + 1)
  );

  let min = Number.MAX_SAFE_INTEGER;
  let color = noteColors[0];
  colors.forEach((value, c) => {
    if (value < min) {
      color = c;
      min = value;
    }
  });
  
  return color;
};

const getNextBrushName = state => {
  let i = 1;
  while(true) {
    const name = `Brush ${i}`;
    if (state.findIndex(b => b.name === name) === -1)
      return name;
    i++;
  }
};