const VoiceProps = (() => {
  'use strict';

  const e = React.createElement;

  const VoiceProps = ({
    id, available,
    voiceColor, changeColor,
  }) => available ? e('div', {}, [

    e(ColorPicker, {
      text: 'Render color: ',
      value: voiceColor,
      change: c => changeColor(id, c),
      key: 1,
    }),
    '(used when brush color mode is set to "From pitch")',

  ]) : 'No voice selected.';

  const mapStateToProps = state => {
    if (state.selectedVoice === -1) return { available: false };
    const voice = state.voices[state.selectedVoice];
    return {
      available: true,
      voiceColor: voice.voiceColor,
    };
  };

  const mapDispatchToProps = dispatch => ({
    changeColor: (id, val) =>
      dispatch({ type: 'UPDATE_VOICE', id, voice: { voiceColor: val }, click }),
  });

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(VoiceProps);
})();