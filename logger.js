const logger = store => next => action => {
  if (action.type === 'UPDATE_NOTE') return next(action);

  console.groupCollapsed(action.type);
  console.log('DISPATCH', action);
  
  let result = next(action);
  
  console.log('NEW STATE', store.getState());
  console.groupEnd();
  
  return result;
};