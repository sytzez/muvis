const midiLoader = file => {
  'use strict';

  let microsecs = 500000;
  const voices = [];
  const notes = [];
  let pitchTop = 64 - 20;
  let pitchBottom = 64 + 20;

  // TODO: set scaleY and tempo to reflect tick resolution
  
  file.track.forEach(track => {
    let zero = true; // track still empty?
    let time = 0;
    const playing = {}; // pitch => id

    track.event.forEach(event => {
      time += event.deltaTime;

      if (event.type === 9) { // note on
        if (zero) { // create new voice on first note
          voices.push({
            noteColor: getNextVoiceColor(voices),
            voiceColor: [1,0,0], // TODO generate random color
          });
          zero = false;
        }
        
        const pitch = 127 - event.data[0];
        if (pitch < pitchTop) pitchTop = pitch;
        if (pitch > pitchBottom) pitchBottom = pitch;

        notes.push({
          id: notes.length,
          pitch: pitch,
          start: time,
          length: 10,
          voice: voices.length - 1,
          brush: 0,
        });
        
        playing[pitch] = notes.length - 1;
      } else if (event.type === 8) { // note off
        const pitch = 127 - event.data[0];
        const id = playing[pitch];

        if (id !== undefined) {
          notes[id].length = time - notes[id].start;
          playing[pitch] = undefined;
        }
      } else if (event.type === 255) { // meta message
        if (event.metaType === 81 && microsecs === 500000) { // set tempo
          microsecs = event.data;
        }
      }
    });
  });
  
  const tempo = [
    { real: 0.0, midi: 0.0, id: 0 },
    { real: microsecs * 0.000001 * 12, midi: file.timeDivision * 12, id: 1 },
  ];

  const closestPowerOf2 = x => Math.pow(2, Math.round(Math.log2(x)));

  // set scale to use 128 pixels for 1 second
  const stepsInSecond = file.timeDivision / (microsecs * 0.000001);
  const scaleX = closestPowerOf2(128.0 / stepsInSecond);

  noteIdCounter = notes.length;
  tempoIdCounter = 2;
  store.dispatch({
    type: 'LOAD_NOTES',
    voices, notes, tempo,
    props: {
      scaleX,
      scaleY: 12,
      tempoScaleX: 128,
      tempoScaleY: scaleX,
      pitchTop, pitchBottom,
    }
  });
};