'use strict';

const playback = (state, action) => {
  const hot = state.hot;

  switch(action.type) {
    case 'PLAY':
      if (hot !== null)
        hot.start();
      return {
        ...state,
        playing: true,
      };
    case 'STOP':
      if (hot !== null)
        hot.stop();
      return {
        ...state,
        playing: false,
        time: 0.0,
      };
    case 'PAUSE':
      if (hot !== null)
        hot.pause();
      return {
        ...state,
        playing: false,
      };
    case 'SET_TIME':
      if (hot !== null && action.hot)
        hot.setTime(action.time);
      return {
        ...state,
        time: action.time,
      };
    case 'SET_HOT_PLAYBACK':
      return {
        ...state,
        hot: action.hotPlayback,
      }
    default:
      return state;
  }
};