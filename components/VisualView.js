const VisualView = (() => {
  'use strict';

  class VisualView extends React.Component {
    canv = null;
    renderer = null;
    playbackListener = this.playback.bind(this);

    renderGL() {
      const { brushes, notes, pitchTop, pitchBottom, timeSpan } = this.props;

      if (!this.renderer) return;

      this.renderer.load(brushes, notes, [0.1, 0.2, 0.3], pitchTop, pitchBottom, timeSpan);
      this.renderer.render(hotPlayback.getTime()); // TODO: appropriate time
    }

    componentDidMount() {
      this.canv = document.getElementById('canvas');
      this.renderer = renderer(this.canv);
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

      return React.createElement('canvas', {
        id: 'canvas',
        className: 'canvas',
        width: 800,
        height: 600,
      });
    }
  }

  const mapStateToProps = state => ({
    brushes: state.brushes,
    notes: state.notes,
    pitchTop: state.pitchTop,
    pitchBottom: state.pitchBottom,
    timeSpan: state.timeSpan,
  });

  return ReactRedux.connect(
    mapStateToProps,
  )(VisualView);
})();