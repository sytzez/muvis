const ErrorView = (() => {
  'use strict';
  const e = React.createElement;
  const br = (key) => e('br', { key });
  return ({ fix }) => e('div', { className: 'bigError' }, [
    'An unexpected error has crashed the app!', br(0),
    'You can try to revert to the previous state by clicking ',
    e('button',{
      onClick: () => {
        store.dispatch({ type: 'UNDO' });
        fix();
      },
      key: 1,
    }, 'undo'), br(2),
    // 'Or you can download the project's state as a JSON file', // TODO
  ]);
})();