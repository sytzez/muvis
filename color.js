const color = (() => {
  'use strict';

  const div = 1.0 / 255.0;

  const hexToRgb = hex => [
    parseInt(hex.substring(1, 3), 16) * div,
    parseInt(hex.substring(3, 5), 16) * div,
    parseInt(hex.substring(5, 7), 16) * div,
  ];

  const toHex = x => (x < 16 ? '0' : '') + x.toString(16)

  const rgbToCss = ([ r, g, b ]) => '#' + 
    toHex(Math.round(r*255)) +
    toHex(Math.round(g*255)) +
    toHex(Math.round(b*255));

  return {
    hexToRgb,
    rgbToCss,
  };
})();