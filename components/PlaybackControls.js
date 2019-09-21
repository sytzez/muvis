const PlaybackControls = (() => {
  const e = React.createElement;

  const PlaybackControls = ({playing, play, pause, stop}) => e('div', {}, [
    e('button', {
      className: playing ? 'selected' : '',
      onClick: playing ? pause : play,
      key: 0,
    }, 'Play'),
    e('button', {
      onClick: pause,
      key: 1,
    }, 'Pause'),
    e('button', {
      onClick: stop,
      key: 2,
    }, 'Stop'),
  ]);

  const mapStateToProps = state => ({
    playing: state.playback.playing,
  });

  const mapDispatchToProps = dispatch => ({
    play: () => dispatch({ type: 'PLAY' }),
    pause: () => dispatch({ type: 'PAUSE' }),
    stop: () => dispatch({ type: 'STOP' }),
  });

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(PlaybackControls);
})();