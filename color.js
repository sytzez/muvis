const color = (() => {
  'use strict';

  const hexToRgb = hex => [
    parseInt(hex.substring(1, 3), 16),
    parseInt(hex.substring(3, 5), 16),
    parseInt(hex.substring(5, 7), 16),
  ];

  const toHex = x => (x < 16 ? '0' : '') + x.toString(16)

  const rgbToCss = ([ r, g, b ]) => `#` + toHex(r) + toHex(g) + toHex(b);

  return {
    hexToRgb,
    rgbToCss,
  };
})();