const ColorPicker = ({text, value, change}) => {
  const e = React.createElement;
  return e('div', {}, [
    text,
    e('input', {
      type: 'color',
      value: color.rgbToCss(value),
      onChange: (e) => {
        click++;
        change(color.hexToRgb(e.target.value))
      },
      key: 0,
    }),
  ])
};