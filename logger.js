const logger = (() => {
  const omit = Object.freeze(new Set([
    'UPDATE_NOTE', 'SET_SCROLL', 
    'MOVE_NOTES', 'RESIZE_NOTES',
  ]));

  return store => next => action => {
    if (omit.has(action.type))
      return next(action);
  
    console.groupCollapsed(action.type);
    console.log('DISPATCH', action);
    
    const result = next(action);
    
    console.log('NEW STATE', store.getState());
    console.groupEnd();
    
    return result;
  };
})();