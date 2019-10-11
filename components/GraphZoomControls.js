const GraphZoomControls = (() => {
  'use strict';

  const e = React.createElement;

  const ZoomControls = ({ scaleX, scaleY, setScaleX, setScaleY }) => (
    e('div', {}, [
      e('button', {
        key: 0,
        onClick: () => setScaleX(scaleX * 0.5),
        disabled: scaleX <= 1,
      }, '-'),
      e('button', {
        key: 1,
        onClick: () => setScaleX(scaleX * 2.0),
      }, '+'),
      '|',
      e('button', {
        key: 2,
        onClick: () => setScaleY(scaleY * 0.5),
        disabled: scaleY <= 0.0078125,
      }, '-'),
      e('button', {
        key: 3,
        onClick: () => setScaleY(scaleY * 2.0),
      }, '+'),
    ])
  );

  const mapStateToProps = state => ({
    scaleX: state.tempoScaleX,
    scaleY: state.tempoScaleY,
  });

  const mapDispatchToProps = dispatch => ({
    setScaleX: (tempoScaleX) => dispatch({ type: 'SET_TEMPO_SCALE_X', tempoScaleX }),
    setScaleY: (tempoScaleY) => dispatch({ type: 'SET_TEMPO_SCALE_Y', tempoScaleY }),
  })

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(ZoomControls);
})();