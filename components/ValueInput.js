const ValueInput = (() => {
  'use strict';

  const e = React.createElement;

  const ValueInput = ({text, min, max, value, automated, change}) =>
    e('div', {}, [
      text,
      e('input', {
        value: value,
        onChange: change,
        key: 1,
      })
    ]);

  return ValueInput;
})();