'use strict';
const List = class extends React.Component {
  grabbedId = -1;

  render() {
    const e = React.createElement;

    const { items, selected, checked,
      checkable = false, removable = false, cloneable = false, insertable = false,
      onSelect, onCheck, onSolo, onRemove, onClone, onInsert } = this.props;
  
    const elements = items.map((i, index) => {
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
  
      sub.push(e('div', {key: -1}, i.name))
  
      if (removable) sub.push(e('button', {
        onClick: (e) => {
          e.stopPropagation();
          onRemove(i.value);
        },
        key: 2,
      }, 'del'));
      
      if (cloneable) sub.push(e('button', {
        onClick: (e) => {
          e.stopPropagation();
          onClone(i.value);
        },
        key: 3,
      }, 'cpy'));
  
      return e('div', {
        className: 'listitem ' + (selected === i.value ? 'selected ' : '') + i.color,
        style: {
          cursor: (selected === i.value && insertable) ? 'ns-resize' : 'auto',
        },
        onClick: selected === i.value ? null : e => onSelect(i.value),
        onMouseDown: insertable ? e => {
          click++;
          this.grabbedId = i.value;
          onSelect(i.value);
        } : null,
        onMouseEnter: insertable ? e => {
          if (this.grabbedId !== -1 && this.grabbedId !== i.value) {
            console.log(this.grabbedId, index);
            onInsert(this.grabbedId, index);
          }
        } : null,
        key: i.value,
      }, sub);
    });
  
    return e('div', {
      className: 'listview',
      onMouseUp: e => this.grabbedId = -1,
    }, elements);
  }
}