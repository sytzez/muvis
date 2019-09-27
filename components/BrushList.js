const BrushList = (() => {
  'use strict';

  const e = React.createElement;

  const BrushList = props => {
    const {
      onNew, active,
      paintable, onPaint, onStopPaint,
      seen, onSee,
    } = props;

    return e('div', {
      className: active ? 'active' : '',
    }, [
      'Brushes:',
      e('button', { onClick: onNew, key: 1 }, 'New'),
      paintable ? e('button', {
        className: active ? 'selected' : '',
        onClick: active ? onStopPaint : onPaint,
        key: 2,
      }, 'Paint') : null,
      paintable ? e('button', {
        className: seen ? 'selected' : '',
        onClick: onSee,
        key: 3,
      }, 'See') : null,
      e(List, {...props, key: 0}),
    ]);
  };

  const mapStateToProps = state => ({
    checkable: true,
    removable: true,
    cloneable: true,
    items: state.brushes.map(b => ({
      value: b.id,
      name: b.name,
      color: b.noteColor,
    })),
    checked: state.visibleBrushes,
    selected: state.selectedBrush,
    active: state.editorMode === editorModes.NOTES &&
      state.editMode === editModes.PAINT,
    paintable: state.editorMode === editorModes.NOTES,
    seen: state.editorMode === editorModes.NOTES &&
      state.colorMode === colorModes.BRUSH,
  });

  const mapDispatchToProps = dispatch => ({
    onNew: () => dispatch({ type: 'NEW_BRUSH', brush: { name:'Brush' } }),
    onSelect: (id) => dispatch({ type: 'SELECT_BRUSH', id: id }),
    onRemove: (id) => dispatch({ type: 'REMOVE_BRUSH', id: id }),
    onCheck: (id) => dispatch({ type: 'SHOW_HIDE_BRUSH', id: id }),
    onSolo: (id) => dispatch({ type: 'SHOW_ONLY_BRUSH', id: id }),
    onClone: (id) => dispatch({ type: 'CLONE_BRUSH', id: id }),
    onPaint: () =>
      dispatch({ type: 'SET_EDIT_MODE', mode: editModes.PAINT }),
    onStopPaint: () =>
      dispatch({ type: 'SET_EDIT_MODE', mode: editModes.NOTES }),
    onSee: () =>
      dispatch({ type: 'SET_COLOR_MODE', mode: colorModes.BRUSH }),
  });

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(BrushList);
})();