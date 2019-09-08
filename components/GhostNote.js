'use strict';
const GhostNote = ({ x, y, w, h, selected }) => (
  React.createElement(
    'div',
    {
      className: 'ghost' + (selected ? ' selected' : ''),
      style: {
        left: x,
        top: y,
        width: w,
        height: h,
      }
    }
  )
);