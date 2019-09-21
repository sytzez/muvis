const ZoomControls = (() => {
  'use strict';

  const e = React.createElement;

  const ZoomControls = ({ scaleX, scaleY, setScaleX, setScaleY }) => (
    e('div', {}, [
      e('button', {
        key: 0,
        onClick: () => setScaleX(scaleX * 0.5),
      }, '-'),
      e('button', {
        key: 1,
        onClick: () => setScaleX(scaleX * 2.0),
      }, '+'),
      '|',
      e('button', {
        key: 2,
        onClick: () => setScaleY(scaleY - 1),
      }, '-'),
      e('button', {
        key: 3,
        onClick: () => setScaleY(scaleY + 1),
      }, '+'),
    ])
  );

  const mapStateToProps = state => ({
    scaleX: state.scaleX,
    scaleY: state.scaleY,
  });

  const mapDispatchToProps = dispatch => ({
    setScaleX: (scaleX) => dispatch({ type: 'SET_SCALE_X', scaleX }),
    setScaleY: (scaleY) => dispatch({ type: 'SET_SCALE_Y', scaleY }),
  })

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(ZoomControls);
})();