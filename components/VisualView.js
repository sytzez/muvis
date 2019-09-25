const VisualView = (() => {
  'use strict';

  const e = React.createElement;

  class VisualView extends React.Component {
    canv = React.createRef();
    renderer = null;
    playbackListener = this.playback.bind(this);

    renderGL() {
      const {
        brushes, voices, notes, tempo,
        background,
        pitchTop, pitchBottom, timeSpan
      } = this.props;

      if (!this.renderer) return;

      this.renderer.load(brushes, voices, notes, tempo, background, pitchTop, pitchBottom, timeSpan);
      this.renderer.render(hotPlayback.getTime()); // TODO: appropriate time
    }

    componentDidMount() {
      this.renderer = renderer(this.canv.current);
      this.renderGL();
      hotPlayback.addListener(this.playbackListener);
    }

    componentWillUnmount() {
      hotPlayback.removeListener(this.playbackListener);
    }

    playback(time) {
      this.renderer.render(time);
    }

    render() {
      this.renderGL();

      return e('div', {
        className: 'canvas_outside',
      }, e('canvas', {
        className: 'canvas',
        ref: this.canv,
        width: 800,//1280,
        height: 600,//1024,
      }));
    }
  }

  const mapStateToProps = state => ({
    background: state.backgroundColor,
    brushes: state.brushes,
    voices: state.voices,
    notes: state.notes,
    tempo: state.tempo,
    pitchTop: state.pitchTop,
    pitchBottom: state.pitchBottom,
    timeSpan: state.timeSpan,
  });

  return ReactRedux.connect(
    mapStateToProps,
  )(VisualView);
})();