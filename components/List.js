'use strict';
const List = ({ items, selected, checked,
  checkable = false, removable = false, cloneable = false,
  onSelect, onCheck, onSolo, onRemove, onClone }) => {

  const e = React.createElement;

  const elements = items.map(i => {
    const sub = [];

    if (checkable) {
      sub.push(e('input', {
        type: 'checkbox',
        checked: checked.includes(i.value),
        onChange: (e) => {
          e.stopPropagation();
          onCheck(i.value, e.target.checked);
        },
        onClick: (e) => e.stopPropagation(),
        key: 0,
      }));
      sub.push(e('button', {
        onClick: (e) => {
          e.stopPropagation();
          onSolo(i.value);
        },
        key: 1,
      }, 's'));
    }

    sub.push(i.name);

    if (removable) sub.push(e('button', {
      onClick: (e) => {
        e.stopPropagation();
        onRemove(i.value);
      },
      key: 2,
    }, '-'));
    
    if (cloneable) sub.push(e('button', {
      onClick: (e) => {
        e.stopPropagation();
        onClone(i.value);
      },
      key: 3,
    }, 'C'));

    return e('div', {
      className: 'listitem ' + (selected === i.value ? 'selected ' : '') + i.color,
      onClick: (e) => onSelect(i.value),
      key: i.value,
    }, sub);
  });

  return e('div', {
    className: 'listview'
  }, elements)
};