const PieceProps = (() => {
  'use strict'

  const e = React.createElement;

  const PieceProps = ({
    background, setBackground,
  }) => e('div', {}, [
    'Piece:',
    'Title',
    'Tempo', // initial, show if there is automation
    e(ColorPicker, {
      text: 'Background:',
      value: background,
      change: setBackground,
      key: 100,
    }),
  ]);

  const mapStateToProps = state => ({
    background: state.backgroundColor,
  });

  const mapDispatchToProps = dispatch => ({
    setBackground: (col) =>
      dispatch({ type: 'UPDATE_PROPS', props: { backgroundColor: col } }),
  })

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(PieceProps);
})();