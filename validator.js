const validateState = (() => {
  'use strict';

  // inspired by
  // https://stackoverflow.com/questions/38616612/javascript-elegant-way-to-check-object-has-required-properties
  const validate = (object, schema) =>
    Object.entries(schema).map( ([prop, validate]) => [
      prop,
      object[prop] !== undefined && validate(object[prop])
    ]).reduce( (result, [prop, valid]) =>
      valid ? result : `${result}'${prop}'. `
    , '');

  const valFunction = v => typeof v === 'function';
  
  const valObject = schema => v =>
    typeof v === 'object' &&
    validate(v, schema) === '';
  
  const valNumber = v => Number(v) === v;

  const valString = v => typeof v === 'string';

  const valBool = v => typeof v === 'boolean';

  const valExist = v => true;

  const valEnum = enumerator => v =>
    Object.values(enumerator).includes(v);

  const valArray = validate => v =>
    valFunction(v.every) &&
    v.every(el => validate(el));
  
  const valArrayOfLength = (length, validate) => v =>
    v.length === length &&
    v.every(el => validate(el));
  
  const valRange = (min, max) => v =>
    v >= min && v <= max;
  
  const valIntRange = (min, max) => v =>
    Number(v) === v && v >= min && v <= max;

  const schema = {
    // content

    voices: valArray(valObject({
      noteColor: valEnum(noteColors),
      voiceColor: valArrayOfLength(3, valNumber),
    })),

    notes: valArray(valObject({
      id: Number.isInteger,
      pitch: Number.isInteger,
      start: valNumber,
      length: valNumber,
      voice: Number.isInteger,
      brush: Number.isInteger,
    })),

    brushes: valArray(valObject({
      id: Number.isInteger,
      name: valString,
      noteColor: valEnum(noteColors),

      timeZoom: valExist,
      timeCurve1: valExist,
      timeCurve2: valExist,

      shape: valEnum(brushShapes),
      playMode: valEnum(brushPlayModes),
      colorMode: valEnum(brushColorModes),

      size: valExist,
      sizeCurve: valExist,

      leftColor: valArrayOfLength(3, valRange(0, 1)),
      rightColor: valArrayOfLength(3, valRange(0, 1)),

      connectMode: valEnum(brushConnectModes),
    })),

    tempo: valArray(valObject({
      real: valNumber,
      midi: valNumber,
      id: Number.isInteger,
    })),

    // editor state

    editorMode: valEnum(editorModes),
    editMode: valEnum(editModes),
    colorMode: valEnum(colorModes),
    propMode: valEnum(propModes),

    selectedBrush: Number.isInteger,
    selectedVoice: Number.isInteger,
    selectedNotes: valArray(Number.isInteger),

    visibleBrushes: valArray(Number.isInteger),
    visibleVoices: valArray(Number.isInteger),

    scaleX: valRange(0.0625, Infinity),
    scaleY: valRange(4, Infinity),
    //scrollX: valRange(0, Infinity),
    //scrollY: valRange(0, 127),
    tempoScaleX: valRange(1, Infinity),
    tempoScaleY: valRange(0.0078125, Infinity),
    //tempoScrollX: valRange(0, Infinity),
    //tempoScrollY: valRange(0, 127),

    // song properties

    title: valString,

    aspectRatio: valEnum(aspectRatios),
    resolution: valArrayOfLength(3, Number.isInteger),
    previewScale: valString,

    timeSpan: valExist,
    pitchTop: valIntRange(0, 127),
    pitchBottom: valIntRange(0, 127),

    backgroundColor: valArrayOfLength(3, valRange(0, 1)),

    ytUrl: valString,

    // playback state

    // playback: valObject({
    //   playing: valBool,
    //   time: valNumber,
    //   // hot: v => v !== undefined,
    // }),

    // history (we don't want)

    // history: v => v === undefined,
  };

  return state => validate(state, schema);
})();