const Select = ({ options, selected, change, tabs = false }) => {
  const e = React.createElement;
  return e('div', { className: tabs ? 'tab' : 'select' }, options.map(
    o => e('button', {
      className: (selected === o.value ? 'selected' : ''),
      value: o.value,
      key: o.value,
      onClick: (e) => change(e.target.value),
    }, o.text)),
  );
};