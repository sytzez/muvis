const App = (() => {
  'use strict';

  const e = React.createElement;

  const App = ({ visual, propMode }) => e('div', {
    className: 'app',
  }, [
    e('header', {key: 0}, [
      e(FileChooser, {key: 0}),
      e(PlaybackControls, {key: 1}),
      e(TimeDisplay, {key: 2}),
    ]),
    e('main', {key: 1}, [
      e('aside', {key: 0, className: 'left'}, [
        e(BrushList, {key: 10}),
        e('hr', {key: 11}),
        e(VoiceList, {key: 20}),
      ]),
      ((visual) => visual ?
        e(VisualView, {key: 1}) :
        e(NoteView, {key: 2})
      )(visual),
      e('aside', {key: 3, className: 'right'}, [
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
      ]),
    ]),
    e('footer', {key: 2}, [
      e(EditModeSelect, {key: 0}),
      '/\\/\\/\\/\\/\\',
      e(ColorModeSelect, {key: 1}),
      '/\\/\\/\\/\\/\\',
      e(ZoomControls, {key: 2}),
    ]),
  ]);

  const mapStateToProps = state => ({
    visual: state.editMode === editModes.VISUAL,
    propMode: state.propMode,
  });

  return ReactRedux.connect(
    mapStateToProps,
  )(App);
})();