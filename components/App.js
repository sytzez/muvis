const App = (() => {
  'use strict';

  const e = React.createElement;

  class App extends React.Component {
    state = {
      hasError: false,
    }

    componentDidCatch(error, info) {
      console.log(error, info);
      this.setState({ hasError: true });
    }

    fix() {
      this.setState({ hasError: false });
    }

    render () {
      const { hasError } = this.state;
      if (hasError) return e(ErrorView, { fix: this.fix.bind(this) });

      const { editorMode, propMode, resolution } = this.props;
      return e('div', {
        className: 'app',
      }, [
        e('header', {key: 0}, [
          e('div', {className: 'filler', key: 0}),
          e(EditorModeSelect, {key: 1}),
          e('div', {className: 'filler', key: 2}),
          //e(PlaybackControls, {key: 2}),
          //e(TimeDisplay, {key: 3}),
          e(UndoRedoControl, {key: 4}),
        ]),
        e('main', {key: 1},
          (editorMode === editorModes.FILES) ?
          e(FileView, {key: 50}) : [
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
                w: 250,
                h: getResolutionHeight(resolution, 250),
                key: 40
              }) : null),
          ]),
          (() => {
            switch(editorMode) {
              case editorModes.NOTES:
                return e(NoteView, {key: 1});
              case editorModes.VISUAL:
                return e(VisualView, {
                  key: 2,
                  small: false,
                  w: resolution[0],
                  h: resolution[1],
                });
              case editorModes.TEMPO:
                return e(TempoGraph, {key: 3});
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
                  return e(VoiceProps, {key: 33});
                default: return '';
              }
            })(propMode),
          ]),
        ]),
        (() => {
          switch(editorMode) {
            case editorModes.NOTES:
              return e('footer', {key: 2}, [
                e(EditModeSelect, {key: 0}),
                e(ColorModeSelect, {key: 2}),
                e('div', {className: 'filler', key: 3}),
                e(ZoomControls, {key: 4}),
              ]);
            case editorModes.TEMPO:
              return e('footer', {key: 3}, [
                e('div', {className: 'filler', key: 1}),
                e(GraphZoomControls, {key: 2}),
              ]);
            default:
              return null;
          }
        })(),
      ]);
    }
  }

  const mapStateToProps = state => ({
    editorMode: state.editorMode,
    propMode: state.propMode,
    resolution: state.resolution,
  });

  return ReactRedux.connect(
    mapStateToProps,
  )(App);
})();