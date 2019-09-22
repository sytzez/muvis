'use strict';

const editModes = Object.freeze({
  PAINT: 'PAINT',
  NOTES: 'NOTES',
  VOICES: 'VOICES',
  VISUAL: 'VISUAL',
});

const colorModes = Object.freeze({
  VOICE: 'VOICE',
  BRUSH: 'BRUSH',
});

const propModes = Object.freeze({
  PIECE: 'PIECE',
  VOICE: 'VOICE',
  BRUSH: 'BRUSH',
})

const store = (() => {
  const initialState = {
    // editor state

    voices: [
      { noteColor: noteColors.RED, voiceColor: [1,0,0] },
      { noteColor: noteColors.TURQOISE, voiceColor: [0,1,0] },
      { noteColor: noteColors.YELLOW, voiceColor: [1,1,0] },
      { noteColor: noteColors.BLUE, voiceColor: [0,0,1] },
    ],
    notes: [],
    brushes: [],
    tempo: [],

    editMode: editModes.NOTES,
    colorMode: colorModes.VOICE,
    propMode: propModes.PIECE,

    selectedBrush: -1,
    selectedVoice: 0,
    selectedNotes: [],

    visibleBrushes: [],
    visibleVoices: [0, 1, 2, 3],

    scaleX: 1,
    scaleY: 16,

    // song properties

    timeSpan: 1000, // how much time fits on a screen
    pitchTop: 64 - 20, // how many semitones fit on a screen
    pitchBottom: 64 + 20, // which pitch is at the center of the screen

    backgroundColor: [0.1, 0.2, 0.3],

    // playback state

    playback: {
      playing: false,
      time: 0.0,
      hot: null,
    },
  };

  const reducer = (state = initialState, action) => {
    switch(action.type) {
      case 'LOAD_NOTES':
        return {
          ...state,
          voices: action.voices,
          notes: action.notes,
          selectedVoice: 0,
          selectedNotes: [],
          visibleVoices: [...action.voices.keys()],
          colorMode: colorModes.VOICE,
        };
      case 'UPDATE_PROPS':
        return {
          ...state,
          ...action.props,
        };
      case 'SET_SCALE_X':
        return {
          ...state,
          scaleX: Math.max(0.0625, action.scaleX),
        };
      case 'SET_SCALE_Y':
        return {
          ...state,
          scaleY: Math.max(4, action.scaleY),
        };
      case 'SET_PITCH_TOP':
        return {
          ...state,
          pitchTop: action.pitch,
          pitchBottom: Math.max(state.pitchBottom, action.pitch + 4),
        };
      case 'SET_PITCH_BOTTOM':
        return {
          ...state,
          pitchBottom: action.pitch,
          pitchTop: Math.min(state.pitchTop, action.pitch - 4),
        };
      case 'SELECT_BRUSH':
        return {
          ...state,
          // make visible if not already visible
          visibleBrushes: state.visibleBrushes.includes(action.id) ?
            state.visibleBrushes : 
            [...state.visibleBrushes, action.id],
          selectedBrush: action.id,
          colorMode: colorModes.BRUSH,
          propMode: propModes.BRUSH,
        };
      case 'SELECT_VOICE':
        return {
          ...state,
          // make visible if not already visible
          visibleVoices: state.visibleVoices.includes(action.id) ?
            state.visibleVoices : 
            [...state.visibleVoices, action.id],
          selectedVoice: action.id,
          colorMode: colorModes.VOICE,
          propMode: propModes.VOICE,
        };
      case 'SET_EDIT_MODE':
        return {
          ...state,
          editMode: action.mode,
          colorMode: action.mode === editModes.PAINT ?
            colorModes.BRUSH : action.mode === editModes.VOICES ?
            colorModes.VOICE : state.colorMode,
        };
      case 'SET_COLOR_MODE':
        return {
          ...state,
          colorMode: action.mode,
        };
      case 'SET_PROP_MODE':
        return {
          ...state,
          propMode: action.mode,
        };
      case 'NEW_BRUSH': case 'CLONE_BRUSH':
        if (state.brushes.length > maxBrushes) return state;

        return {
          ...state,
          visibleBrushes: [ ...state.visibleBrushes, brushIdCounter ],
          selectedBrush: brushIdCounter,
          propMode: propModes.BRUSH,
          editMode: state.editMode === editModes.NOTES ?
            editModes.NOTES :
            editModes.PAINT,
          colorMode: colorModes.BRUSH,
          brushes: brushes(state.brushes, action),
        };
      case 'REMOVE_BRUSH':
        return {
          ...state,
          selectedBrush: state.selectedBrush === action.id ?
            -1 : state.selectedBrush,
          visibleBrushes: state.visibleBrushes.filter(id => id !== action.id),
          notes: notes(state.notes, action),
          brushes: brushes(state.brushes, action),
        };
      case 'SHOW_HIDE_BRUSH':
        return {
          ...state,
          visibleBrushes: state.visibleBrushes.includes(action.id) ?
            state.visibleBrushes.filter(id => id !== action.id) :
            [...state.visibleBrushes, action.id],
        };
      case 'SHOW_ALL_BRUSHES':
        return {
          ...state,
          visibleBrushes: state.brushes.map(brush => brush.id),
        };
      case 'SHOW_ONLY_BRUSH':
        // show all if that one is already soloed
        if (state.visibleBrushes.length === 1 &&
          state.visibleBrushes[0] === action.id) {
          return {
            ...state,
            selectedBrush: action.id,
            visibleBrushes: state.brushes.map(brush => brush.id),
          };
        } else {
          return {
            ...state,
            selectedBrush: action.id,
            visibleBrushes: [action.id]
          };
        }
      case 'NEW_VOICE':
        return {
          ...state,
          visibleVoices: [...state.visibleVoices, state.voices.length],
          selectedVoice: state.voices.length,
          propMode: propModes.VOICE,
          editMode: state.editMode === editModes.NOTES ?
            editModes.NOTES :
            editModes.VOICES,
          colorMode: colorModes.VOICE,
          voices: voices(state.voices, action),
        }
      case 'SHOW_HIDE_VOICE':
        return {
          ...state,
          visibleVoices: state.visibleVoices.includes(action.id) ?
            state.visibleVoices.filter(id => id !== action.id) :
            [...state.visibleVoices, action.id],
        };
      case 'SHOW_ALL_VOICES':
        return {
          ...state,
          visibleVoices: [...state.voices.keys()],
        };
      case 'SHOW_ONLY_VOICE':
        // show all if that one is already soloed
        if (state.visibleVoices.length === 1 &&
          state.visibleVoices[0] === action.id) {
          return {
            ...state,
            visibleVoices: [...state.voices.keys()],
            selectedVoice: action.id,
          };
        } else {
          return {
            ...state,
            visibleVoices: [action.id],
            selectedVoice: action.id,
          };
        }
      default:
        return {
          ...state,
          notes: notes(state.notes, action),
          voices: voices(state.voices, action),
          selectedNotes: selectedNotes(state.selectedNotes, action),
          brushes: brushes(state.brushes, action),
          playback: playback(state.playback, action),
        };
    }
  };

  return Redux.createStore(
    reducer,
    Redux.applyMiddleware(logger),
  );
})();

const getVisibleNotes = (state) => state.notes.filter(n =>
  (n.brush === -1 || state.visibleBrushes.includes(n.brush))
  &&
  (state.visibleVoices.includes(n.voice))
);