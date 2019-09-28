const UndoRedoControl = (() => {
  'use strict';

  const e = React.createElement;

  const UndoRedoControl = ({
    undoAvailable, redoAvailable,
    undo, redo,
  }) => e('div', {}, [
    e('button', {
      onClick: undo,
      disabled: !undoAvailable,
      key: 0,
    }, 'Undo'),
    e('button', {
      onClick: redo,
      disabled: !redoAvailable,
      key: 1,
    }, 'Redo'),
  ]);

  const mapStateToProps = state => ({
    undoAvailable: state.history.past.length !== 0,
    redoAvailable: state.history.future.length !== 0,
  });

  const mapDispatchToProps = dispatch => ({
    undo: () => dispatch({ type: 'UNDO' }),
    redo: () => dispatch({ type: 'REDO' }),
  });

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(UndoRedoControl);
})();