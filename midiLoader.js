const midiLoader = file => {
  'use strict';

  console.log(file);

  const voices = [];
  const notes = [];

  const getVoiceColor = () => (
    [
      noteColors.RED,
      noteColors.TURQOISE,
      noteColors.YELLOW,
      noteColors.BLUE,
    ][voices.length % 4]
  );
  
  file.track.forEach(track => {
    let zero = true; // track still empty?
    let time = 0;
    const playing = {}; // pitch => id

    track.event.forEach(event => {
      time += event.deltaTime;


      if (event.type === 9) { // note on
        if (zero) { // create new voice on first note
          voices.push({ noteColor: getVoiceColor() });
          zero = false;
        }
        
        const pitch = 127 - event.data[0];

        notes.push({
          id: notes.length,
          pitch: pitch,
          start: time,
          length: 10,
          voice: voices.length - 1,
          brush: -1,
        });
        
        playing[pitch] = notes.length - 1;
      } else if (event.type === 8) { // note off
        const pitch = 127 - event.data[0];
        const id = playing[pitch];

        if (id !== undefined) {
          notes[id].length = time - notes[id].start;
          playing[pitch] === undefined;
        }
      }
    });
  });

  store.dispatch({ type: 'LOAD_NOTES', voices, notes });
};