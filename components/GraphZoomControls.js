const GraphZoomControls = (() => {
  'use strict';

  const e = React.createElement;

  const ZoomControls = ({ scaleX, scaleY, setScaleX, setScaleY }) => (
    e('div', {}, [
      e('button', {
        key: 0,
        onClick: () => setScaleX(scaleX * Math.SQRT2 * 0.5),
      }, '-'),
      e('button', {
        key: 1,
        onClick: () => setScaleX(scaleX * Math.SQRT2),
      }, '+'),
      '|',
      e('button', {
        key: 2,
        onClick: () => setScaleY(scaleY * Math.SQRT2 * 0.5),
      }, '-'),
      e('button', {
        key: 3,
        onClick: () => setScaleY(scaleY * Math.SQRT2),
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