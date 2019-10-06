const UndoRedoControl = (() => {
  'use strict';

  const e = React.createElement;

  class UndoRedoControl extends React.Component {
    keyListener = this.onKeyDown.bind(this);
    
    onKeyDown(e) {
      const {
        undoAvailable, redoAvailable,
        undo, redo,
      } = this.props;

      if (e.keyCode === 90 && e.ctrlKey) {
        e.preventDefault();
        if (undoAvailable) undo();
      } else if (e.keyCode === 89 && e.ctrlKey) {
        e.preventDefault();
        if (redoAvailable) redo();
      }
    }

    componentDidMount() {
      window.addEventListener('keydown', this.keyListener);
    }

    componentWillUnmount() {
      window.removeEventListener('keydown', this.keyListener);
    }

    render() {
      const {
        undoAvailable, redoAvailable,
        undo, redo,
      } = this.props;

      return e('div', {}, [
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
    }
  }

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