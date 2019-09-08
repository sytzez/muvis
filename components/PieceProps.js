const PieceProps = (() => {
  'use strict'

  const e = React.createElement;

  const PieceProps = ({}) => e('div', {}, [
    'Piece:',
    'Title',
    'Tempo', // initial, show if there is automation
    'Background color', // automate?
  ]);

  const mapStateToProps = state => ({

  });

  return ReactRedux.connect(
    mapStateToProps,
  )(PieceProps);
})();