const BrushList = (() => {
  'use strict';

  const e = React.createElement;

  const BrushList = props => {
    const { onNew } = props;

    return e('div', {}, [
      'Brushes:',
      e(List, {...props, key: 0}),
      e('button', {onClick: onNew, key: 1}, 'New brush'),
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
  });

  const mapDispatchToProps = dispatch => ({
    onNew: () => dispatch({ type: 'NEW_BRUSH', brush: { name:'Brush' } }),
    onSelect: (id) => dispatch({ type: 'SELECT_BRUSH', id: id }),
    onRemove: (id) => dispatch({ type: 'REMOVE_BRUSH', id: id }),
    onCheck: (id) => dispatch({ type: 'SHOW_HIDE_BRUSH', id: id }),
    onSolo: (id) => dispatch({ type: 'SHOW_ONLY_BRUSH', id: id }),
    onClone: (id) => dispatch({ type: 'CLONE_BRUSH', id: id }),
  });

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(BrushList);
})();