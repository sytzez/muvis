'use strict';

const tempoChangeDesign = {
  real: 0.0, // real time in seconds
  midi: 0.0, // midi time
  id: 0,
};

let tempoIdCounter = 10;

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

const getTimeAt = (state, t) => {
  return 0.0; // TODO
};