const jsonLoader = json => {
  const state = JSON.parse(json);

  const errors = validateState(state);
  if (errors !== '') {
    console.log('Errors in: ' + errors);
    throw(new Error('Invalid structure'));
  }

  brushIdCounter = 0;
  state.brushes.forEach(b => 
    (b.id >= brushIdCounter) && brushIdCounter++);
  
  tempoIdCounter = 0;
  state.tempo.forEach(t =>
    (t.id >= tempoIdCounter) && tempoIdCounter++);
  
  noteIdCounter = 0;
  state.notes.forEach(n =>
    (n.id >= noteIdCounter) && noteIdCounter++);

  store.dispatch({ type: 'LOAD_STATE', state });
};

const jsonSaver = state => {
  const cleanState = {
    ...state,
    playback: {},
    history: {},
  }
  return JSON.stringify(cleanState);
};

const loadJsonFromUrl = (url, errorCallback) => {
  const req = new XMLHttpRequest();
  req.open('GET', url);
  req.onload = () => {
    if (req.status === 200) {
      try {
        jsonLoader(req.responseText);
      } catch(e) {
        errorCallback();
      }
    } else {
      errorCallback();
    }
  };
  req.send();
};