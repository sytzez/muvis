const PitchInput = (() => {
  'use strict';
  
  const noteNames = Object.freeze((() => {
    const names = [];
    for(let i = 127; i >= 0; i--) {
      const octave = -1 + Math.floor(i / 12);
      const name = [
        'C','C#/Db','D','D#/Eb','E','F',
        'F#/Gb','G','G#/Ab','A','A#/Bb','B',
      ][i % 12];
      names.push(name + octave);
    }
    return names;
  })());

  class PitchInput extends React.Component {
    render() {
      const e = React.createElement;

      const { change, text, value } = this.props;

      const options = noteNames.map((name, value) =>
        e('option', {
          value,
          key: value,
        }, name));
      
      return e('div', {}, [ text, e('select', {
        value,
        onChange: e => {
          click++;
          change(parseInt(e.target.value));
        },
        key: 0,
      }, options) ]);
    }
  }

  return PitchInput;
})();
