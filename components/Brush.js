const Brush = (() => {
  'use strict';

  const e = React.createElement;

  const Brush = ({ selected, name, onSelect, onRemove, onClone }) => {
    const style = {};

    if (selected) style.backgroundColor = "#ccc";

    return e('div', {onClick: onSelect, style}, [
      name,
      e('button', {onClick: (e) => {
        onRemove();
        e.stopPropagation();
      }, key: 1}, '-'),
      e('button', {onClick: (e) => {
        onClone();
        e.stopPropagation();
      }, key: 2}, 'C'),
    ])
  };

  const mapDispatchToProps = (dispatch, ownProps) => ({
    onSelect: () => dispatch({ type: 'SELECT_BRUSH', id: ownProps.id }),
    onRemove: () => dispatch({ type: 'REMOVE_BRUSH', id: ownProps.id }),
  })

  return ReactRedux.connect(
    null,
    mapDispatchToProps,
  )(Brush);
})();