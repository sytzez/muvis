const App = (() => {
  'use strict';

  const e = React.createElement;

  const App = ({ editorMode, propMode }) => e('div', {
    className: 'app',
  }, [
    e('header', {key: 0}, [
      e(FileChooser, {key: 0}),
      e(EditorModeSelect, {key: 1}),
      '/\\/\\/\\/\\/\\',
      //e(PlaybackControls, {key: 2}),
      //e(TimeDisplay, {key: 3}),
      e(UndoRedoControl, {key: 4}),
    ]),
    e('main', {key: 1}, [
      e('aside', {key: 0, className: 'left'}, [
        e(BrushList, {key: 10}),
        e('hr', {key: 11}),
        e(VoiceList, {key: 20}),
        e('hr', {key: 21}),
        e(YouTubeView, {key: 30}),
        e('hr', {key: 31}),
        (editorMode !== editorModes.VISUAL ?
          e(VisualView, {
            small: true,
            w: 200, h: 150,
            key: 40
          }) : null),
      ]),
      (() => {
        switch(editorMode) {
          case editorModes.NOTES:
            return e(NoteView, {key: 1});
          case editorModes.VISUAL:
            return e(VisualView, { key: 2, small: false, w: 800, h: 600 });
          case editorModes.TEMPO:
            return e(TempoGraph, {key: 3});
          //case editorModes.YOUTUBE:
          //  return e(YouTubeView, {key: 4});
          default:
            return null;
        }
      })(),
      e('aside', {key: 100, className: 'right'}, [
        e(PropModeSelect, {key: 30}),
        e('hr', {key: 30.5}),
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
    editorMode: state.editorMode,
    propMode: state.propMode,
  });

  return ReactRedux.connect(
    mapStateToProps,
  )(App);
})();