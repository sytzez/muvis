const ValueInput = ({text, min, max, value, automated, change}) => {
  const e = React.createElement;
  return e('div', {}, [
    text,
    e('input', {
      value: value,
      size: 4,
      onChange: (e) => change(e.target.value),
      key: 1,
    })
  ]);
};
