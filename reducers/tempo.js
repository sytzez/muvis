'use strict';

const tempoChangeDesign = {
  real: 0.0, // real time in seconds
  midi: 0.0, // midi time
  id: 0,
};

let tempoIdCounter = 2;

const tempo = (state, action) => {
  switch(action.type) {
    case 'INSERT_TEMPO_CHANGE':
      return [
        ...state,
        { ...action.tempoChange, id: tempoIdCounter++ } 
      ].sort((a, b) => a.real - b.real);
    case 'REMOVE_TEMPO_CHANGE':
      return (state.length <= 2) ? state :
        state.filter(e => e.id !== action.id);
    case 'UPDATE_TEMPO_CHANGE':
      return state.map(e => (e.id === action.id) ?
        { ...e, ...action.tempoChange } : e);
    default:
      return state;
  }
};

// get midi time from real time
const getMidiFromReal = (state, real) => {
  const length = state.length;
  let i = 1;
  while(i < length - 1 && state[i].real < real)
    i++;
  const a = state[i - 1];
  const b = state[i];
  const slope = (b.midi - a.midi) / (b.real - a.real);
  return a.midi + (real - a.real) * slope;
};

// get real time from midi time
const getRealFromMidi = (state, midi) => {
  const length = state.length;
  let i = 1;
  while(i < length - 1 && state[i].midi < midi)
    i++;
  const a = state[i - 1];
  const b = state[i];
  const slope = (b.real - a.real) / (b.midi - a.midi);
  return a.real + (midi - a.midi) * slope;
}