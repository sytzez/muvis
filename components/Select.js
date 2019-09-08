// // alternative (list box)
// const Select = ({ options, selected, onChange }) => {
//   const e = React.createElement;
//   return e('select', {
//     value: selected,
//     onChange: onChange,
//   }, options.map(
//     o => e('option', {
//       value: o.value,
//       key: o.value,
//     }, o.text)),
//   );
// };
const Select = ({ options, selected, onChange }) => {
  const e = React.createElement;
  return e('div', {}, options.map(
    o => e('button', {
      className: (selected === o.value) ? 'selected' : '',
      value: o.value,
      key: o.value,
      onClick: onChange,
    }, o.text)),
  );
};