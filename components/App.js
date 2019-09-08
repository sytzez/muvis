const App = (() => {
  'use strict';

  const e = React.createElement;

  const App = ({ visual, propMode }) => e('div', {}, [
    e(EditModeSelect, {key: 0}),
    e(ColorModeSelect, {key: 1}),
    e(BrushList, {key: 10}),
    e(VoiceList, {key: 11}),
    ((visual) => visual ?
      e(VisualView, {key: 20}) :
      e(NoteViewContainer, {key: 21})
    )(visual),
    e(PropModeSelect, {key: 30}),
    ((propMode) => {
      switch(propMode) {
        case propModes.PIECE:
          return e(PieceProps, {key: 31});
        case propModes.BRUSH:
          return e(BrushProps, {key: 32});
        case propModes.VOICE:
          return ''; // TODO put voice properties here
        default: return '';
      }
    })(propMode),
  ]);

  const mapStateToProps = state => ({
    visual: state.editMode === editModes.VISUAL,
    propMode: state.propMode,
  });

  return ReactRedux.connect(
    mapStateToProps,
  )(App);
})();