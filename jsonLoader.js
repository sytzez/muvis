const jsonLoader = json => {
  const state = JSON.parse(json);

  const errors = validateState(state);
  if (errors !== '') {
    console.log('Errors in: ' + errors);
    throw(new Error('Invalid structure'));
  }

  store.dispatch({ type: 'LOAD_STATE', state });
};