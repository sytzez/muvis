'use strict';

const voiceTemplate = Object.freeze({
  noteColor: noteColors.RED,
  
  voiceColor: [0, 0, 1],
});

const voices = (state, action) => {
  switch(action.type) {
    case 'NEW_VOICE':
      return [
        ...state,
        {
          ...voiceTemplate,
          noteColor: getNextVoiceColor(state)
        },
      ];
    case 'UPDATE_VOICE':
      return state.map((v, id) =>
        id === action.id ? { ...v, ...action.voice } : v
      );
    default:
      return state;
  }
};

const getNextVoiceColor = (state) =>
  noteColors[state.length % 18];