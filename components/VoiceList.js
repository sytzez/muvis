const VoiceList = (() => {
  'use strict';

  const e = React.createElement;

  const VoiceList = props => {
    const { onNew } = props;

    return e('div', {}, [
      'Voices:',
      e('button', {onClick: onNew, key: 1}, 'New'),
      e(List, {...props, key: 0}),
    ]);
  };

  const mapStateToProps = state => ({
    checkable: true,
    removable: false,
    cloneable: false,
    items: state.voices.map((v, i) => ({
      value: i,
      name: 'Voice ' + (i + 1),
      color: v.noteColor,
    })),
    checked: state.visibleVoices,
    selected: state.selectedVoice,
  });

  const mapDispatchToProps = dispatch => ({
    onSelect: (id) => dispatch({ type: 'SELECT_VOICE', id: id }),
    onCheck: (id) => dispatch({ type: 'SHOW_HIDE_VOICE', id: id }),
    onSolo: (id) => dispatch({ type: 'SHOW_ONLY_VOICE', id: id }),
    onNew: () => dispatch({ type: 'NEW_VOICE' }),
  });

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(VoiceList);
})();