const tempoChangeDesign = {
  time: 0,
  tempo: 0,
  transition: 0, // type of transition, e.g. linear, instant,...
};

const tempo = (state, action) => {
  switch(action.type) {
    case 'INSERT_TEMPO_CHANGE':
      return state;
    case 'REMOVE_TEMPO_CHANGE':
      return state;
    case 'UPDATE_TEMPO_CHANGE':
      return state;
    default:
      return state;
  }
}