'use strict';

const aspectRatios = Object.freeze({
  r3x4: 'r3x4',
  r16x9: 'r16x9',
  other: 'other',
});

const resolutions = Object.freeze({
  r3x4: [
    [800, 600],
  ],
  r16x9: [
    [1280, 720],
    [1920, 1080],
    [2560, 1440],
    [3840, 2460],
  ],
});

const getAspectRatioFromResolution = ([x, y]) => {
  for(const ratio of aspectRatios) {
    for(const resolution of resolutions[ratio]) {
      if (resolution[0] === x && resolution[1] === y)
        return ratio;
    }
  }
  return aspectRatios.other;
};

const getResolutionHeight = ([x, y], w) => (y / x) * w;