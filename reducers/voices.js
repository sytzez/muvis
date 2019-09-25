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
      ]
    default:
      return state;
  }
};

const getNextVoiceColor = (state) => {
  switch(state.length % 4) {
    case 0: return noteColors.RED;
    case 1: return noteColors.TURQOISE;
    case 2: return noteColors.YELLOW;
    case 3: return noteColors.BLUE;
  }
}