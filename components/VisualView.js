const VisualView = (() => {
  'use strict';

  const e = React.createElement;

  class VisualView extends React.Component {
    canv = React.createRef();
    renderer = null;
    animationFrame = 0;
    frameCallback = this.frame.bind(this);
    lastTime = 0;

    loadGL() {
      const {
        brushes, voices, notes, tempo,
        background,
        pitchTop, pitchBottom, timeSpan
      } = this.props;

      if (!this.renderer) return;

      this.renderer.load(brushes, voices, notes, tempo, background, pitchTop, pitchBottom, timeSpan);
      this.renderer.render(hotPlayback.getTime());
    }

    frame() {
      const time = hotPlayback.getTime();
      if (time !== this.lastTime) {
        this.renderer.render(time);
        this.lastTime = time;
      }
      this.animationFrame = requestAnimationFrame(this.frameCallback);
    }

    componentDidMount() {
      this.renderer = renderer(this.canv.current);
      this.loadGL();
      this.animationFrame = requestAnimationFrame(this.frameCallback);
    }

    componentWillUnmount() {
      cancelAnimationFrame(this.animationFrame);
    }

    render() {
      const { w, h, small } = this.props;

      this.loadGL();

      return e('div', {
        className: small ? 'canvas_small_outside' : 'canvas_outside',
        style: small ? {
          width: w,
          height: h,
        } : {},
      }, e('canvas', {
        className: 'canvas',
        ref: this.canv,
        width: w,//1280,
        height: h,//1024,
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