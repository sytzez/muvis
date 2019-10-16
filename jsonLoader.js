const jsonLoader = (json, editorMode = editorModes.NOTES)  => {
  const state = typeof json === 'string' ? JSON.parse(json) : json;

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
  state.notes.forEach(n => {
    if (n.id >= noteIdCounter)
      noteIdCounter = n.id + 1;
  });

  hotPlayback.stop();
  store.dispatch({ type: 'LOAD_STATE', state, editorMode });
};

const jsonSaver = state => {
  const cleanState = {
    ...state,
    playback: {},
    history: {},
    action: {},
  };
  return JSON.stringify(cleanState);
};

const loadJsonFromUrl = (url, errorCallback) => {
  try {
    fetch(url)
      .then(res => res.json())
      .then(obj => jsonLoader(obj, editorModes.VISUAL))
      .catch(errorCallback);
  } catch(e) {
    errorCallback(e);
  }
};