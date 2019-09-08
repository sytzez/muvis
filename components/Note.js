const Note = (() => {
  'use strict';

  const e = React.createElement;

  const Note = ({ id, selected, resizable, x, y, w, h, color,
    onMouseDown, onMouseUp, onMouseEnter }) => {
    return e(
      'div',
      {
        className: 'note ' + (selected ? 'selected ' : '') + color,
        onMouseDown: (e) => onMouseDown(id, e),
        onMouseEnter: (e) => onMouseEnter(id, e),
        onMouseUp: (e) => onMouseUp(id, e),
        onContextMenu: (e) => {
          e.preventDefault();
          onMouseUp(id, e);
        },
        style: {
          left: x,
          top: y,
          width: w,
          height: h,
        },
      },
      resizable ? [
        e('div', {
          className: 'note_left',
          onMouseDown: (e) => {
            e.stopPropagation();
            onMouseDown(id, e, -1)
          },
          key: 0,
        }),
        e('div', {
          className: 'note_right',
          onMouseDown: (e) => {
            e.stopPropagation();
            onMouseDown(id, e, 1)
          },
          key: 1,
        })
      ] : null,
    );
  };

  return Note;
})();