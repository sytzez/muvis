const Select = ({ options, selected, change }) => {
  const e = React.createElement;
  return e('div', {}, options.map(
    o => e('button', {
      className: (selected === o.value) ? 'selected' : '',
      value: o.value,
      key: o.value,
      onClick: (e) => change(e.target.value),
    }, o.text)),
  );
};