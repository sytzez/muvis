'use strict';

const editorModes = Object.freeze({
  FILES: 'FILES',
  NOTES: 'NOTES',
  VISUAL: 'VISUAL',
  TEMPO: 'TEMPO',
  // YOUTUBE: 'YOUTUBE',
})

const editModes = Object.freeze({
  PAINT: 'PAINT',
  NOTES: 'NOTES',
  VOICES: 'VOICES',
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
    // content

    voices: [
      { noteColor: noteColors[0], voiceColor: [1,0,0] },
      { noteColor: noteColors[1], voiceColor: [0,1,0] },
      { noteColor: noteColors[2], voiceColor: [1,1,0] },
      { noteColor: noteColors[3], voiceColor: [0,0,1] },
    ],
    notes: [],
    brushes: [
      { ...brushTemplate, id: 0 },
    ],
    tempo: [
      { real: 0.0, midi: 0.0, id: 0 },
      { real: 1.0, midi: 100.0, id: 1 },
    ],

    // editor state

    editorMode: editorModes.FILES,
    editMode: editModes.NOTES,
    colorMode: colorModes.VOICE,
    propMode: propModes.PIECE,

    selectedBrush: 0,
    selectedVoice: 0,
    selectedNotes: [],

    visibleBrushes: [ 0 ],
    visibleVoices: [ 0, 1, 2, 3 ],

    scaleX: 1,
    scaleY: 12,
    scrollX: 0,
    scrollY: 64 - 20,

    tempoScaleX: 128,
    tempoScaleY: 1,
    tempoScrollX: 0,
    tempoScrollY: 0,

    // song properties

    title: 'Untitled',

    timeSpan: 6, // how much time fits on a screen (in seconds)
    pitchTop: 64 - 20, // how many semitones fit on a screen
    pitchBottom: 64 + 20, // which pitch is at the center of the screen

    backgroundColor: [0.08, 0.08, 0.08],

    ytUrl: '',

    // playback state

    playback: {
      playing: false,
      time: 0.0,
      hot: null,
    },

    // history

    history: {
      past: [],
      future: [],
    }
  };

  const reducer = (_state = initialState, action) => {
    const state = {
      ..._state,
      action,
    };

    switch(action.type) {
      case 'UNDO': {
        const past = state.history.past;
        const future = state.history.future;
        if (past.length === 0) return state;
        return {
          ...state,
          ...past[past.length - 1],
          history: {
            past: past.slice(0, past.length - 1),
            future: [ ...future, historyFromState(state) ],
          },
        };
      } case 'REDO': {
        const past = state.history.past;
        const future = state.history.future;
        if (future.length === 0) return state;
        return {
          ...state,
          ...future[future.length - 1],
          history: {
            past: [ ...past, historyFromState(state) ],
            future: future.slice(0, future.length - 1),
          },
        };
      } case 'LOAD_NOTES':
        brushIdCounter = 1;
        return {
          ...initialState,
          voices: action.voices,
          notes: action.notes,
          tempo: action.tempo,
          visibleVoices: [ ...action.voices.keys() ],
          colorMode: colorModes.VOICE,
          editorMode: editorModes.NOTES,
          editMode: editModes.NOTES,
          ...action.props,
          history: history(state, action),
        };
      case 'INSERT_NOTES':
        return {
          ...state,
          notes: [
            ...state.notes,
            ...action.notes.map(n => ({
              ...n,
              id: noteIdCounter++,
              brush: state.brushes.some(b =>
                b.id === n.brush) ? n.brush : -1,
              voice: n.voice % state.voices.length,
            })),
          ],
          selectedNotes: (() => {
            const array = [];
            for(let i = noteIdCounter - action.notes.length; i < noteIdCounter; i++) {
              array.push(i);
            }
            return array;
          })(),
          history: history(state, action),
        };
      case 'LOAD_STATE':
        return {
          ...action.state,
          playback: initialState.playback,
          editorMode: action.editorMode,
          history: history(state, action),
        };
      case 'LOAD_EMPTY':
        return {
          ...initialState,
          editorMode: editorModes.NOTES,
          history: history(state, action),
        };
      case 'UPDATE_PROPS':
        return {
          ...state,
          ...action.props,
          history: history(state, action),
        };
      case 'SET_SCALE_X':
        return {
          ...state,
          scaleX: Math.max(0.015625, action.scaleX),
        };
      case 'SET_SCALE_Y':
        return {
          ...state,
          scaleY: Math.max(4, action.scaleY),
        };
      case 'SET_SCROLL':
        return {
          ...state,
          scrollX: Math.max(0, action.scrollX),
          scrollY: Math.max(0, action.scrollY),
        };
      case 'SET_TEMPO_SCROLL':
        return {
          ...state,
          tempoScrollX: Math.max(0, action.tempoScrollX),
          tempoScrollY: Math.max(0, action.tempoScrollY),
        };
      case 'SET_TEMPO_SCALE_X':
        return {
          ...state,
          tempoScaleX: Math.max(1, action.tempoScaleX),
        };
      case 'SET_TEMPO_SCALE_Y':
        return {
          ...state,
          tempoScaleY: Math.max(0.001953125, action.tempoScaleY),
        };
      case 'SET_TEMPO_SCALE':
        return {
          ...state,
          tempoScaleX: Math.max(1, action.tempoScaleX),
          tempoScaleY: Math.max(0.001953125, action.tempoScaleY),
        };
      case 'SET_PITCH_TOP':
        return {
          ...state,
          pitchTop: action.pitch,
          pitchBottom: Math.max(state.pitchBottom, action.pitch + 4),
          history: history(state, action),
        };
      case 'SET_PITCH_BOTTOM':
        return {
          ...state,
          pitchBottom: action.pitch,
          pitchTop: Math.min(state.pitchTop, action.pitch - 4),
          history: history(state, action),
        };
      case 'SELECT_BRUSH':
        return {
          ...state,
          // make visible if not already visible
          visibleBrushes: state.visibleBrushes.includes(action.id) ?
            state.visibleBrushes : 
            [...state.visibleBrushes, action.id],
          selectedBrush: action.id,
          editMode: state.editMode === editModes.VOICES ?
            editModes.PAINT : state.editMode,
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
          editMode: state.editMode === editModes.PAINT ?
            editModes.VOICES : state.editMode,
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
      case 'SET_EDITOR_MODE':
        return {
          ...state,
          editorMode: action.mode,
          editMode: editModes.NOTES,
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
        if (state.brushes.length >= maxBrushes) return state;

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
          history: history(state, action),
        };
      case 'REMOVE_BRUSH':
        return {
          ...state,
          selectedBrush: state.selectedBrush === action.id ?
            -1 : state.selectedBrush,
          visibleBrushes: state.visibleBrushes.filter(id => id !== action.id),
          notes: notes(state.notes, action),
          brushes: brushes(state.brushes, action),
          history: history(state, action),
        };
      case 'SHOW_HIDE_BRUSH':
        console.log(state.visibleBrushes);
        console.log(state.visibleBrushes.includes(action.id));
        return {
          ...state,
          visibleBrushes: state.visibleBrushes.includes(action.id) ?
            state.visibleBrushes.filter(id => id !== action.id) :
            [ ...state.visibleBrushes, action.id ],
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
          history: history(state, action),
        };
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
          tempo: tempo(state.tempo, action),
          playback: playback(state.playback, action),
          history: history(state, action),
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
