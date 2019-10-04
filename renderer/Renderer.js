const renderer = (canv) => {
  'use strict';

  const source = `// vertex shader
attribute vec2 a_position;
uniform vec2 u_vertex_position;
uniform float u_vertex_scale;
void main() {
  gl_Position = vec4(a_position * u_vertex_scale + u_vertex_position, 0, 1);
}`;

  const attributes = {preserveDrawingBuffer: true};
  const gl = canv.getContext('webgl', attributes) ||
    canv.getContext('experimental-webgl', attributes); // TODO message if failed
  
  var brushes = [];

  const square = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, square);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1.0,-1.0, 1.0,-1.0, -1.0,1.0,
    -1.0,1.0 ,1.0,-1.0, 1.0,1.0,
  ]), gl.STATIC_DRAW);

  const shader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  console.log(gl.getShaderInfoLog(shader));

  const normalBrush = NormalBrush(gl, shader);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

  function load(newBrushes, voices, notes, tempo, background, pitchBottom, pitchTop, timeSpan) {
    gl.clearColor(...background, 1.0);

    brushes = [];
    notes = notes.sort((a, b) => a.start - b.start);

    newBrushes.forEach(b => {
      const brush = {
        notes: [],
        xzoom: timeSpan / b.timeZoom,
        yzoom: pitchBottom - pitchTop,
        yoffset: pitchTop - 0.5,
        xoffset: -0.5 * timeSpan / b.timeZoom, // set 0 in the middle of the screen
        shape: b.shape,
        playMode: b.playMode,
        size: b.size,
        sizeCurve: b.sizeCurve,
        timeCurve1: b.timeCurve1,
        timeCurve2: 1.0 / b.timeCurve2,
        connectMode: b.connectMode,
        appearBack: b.appearBack,
        // TODO other properties
      };

      let colorFunc;
      switch(b.colorMode) {
        case brushColorModes.VOICE:
          colorFunc = (n) => [voices[n.voice].voiceColor, [1,1,1]];
          break;
        case brushColorModes.PITCH:
          colorFunc = (n) => [
            [[1,0,0], [1,1,1]],
            [[.75,0,.25], [1,1,1]],
            [[.5,0,.5], [1,1,1]],
            [[.25,0,.75], [1,1,1]],
            [[0,0,1], [1,1,1]],
            [[0,.5,.5], [1,1,1]],
            [[0,1,0], [1,1,1]],
            [[.25,.75,0], [1,1,1]],
            [[.5,.5,0], [1,1,1]],
            [[.625,.375,0], [1,1,1]],
            [[.75,.25,0], [1,1,1]],
            [[.875,.125,0], [1,1,1]],
          ][(n.pitch * 7) % 12];
          break;
        case brushColorModes.UNIFORM:
        default:
          colorFunc = () => [b.leftColor, b.rightColor];
      }

      const lastNotePerVoice = new Array(voices.length);

      const inv_xzoom = 2.0 / brush.xzoom;
      const inv_yzoom = 2.0 / brush.yzoom;

      notes.forEach(n => { // TODO: loop over notes only once 
        if (n.brush === b.id) {
          const colors = colorFunc(n);
          const realStart = getRealFromMidi(tempo, n.start);
          const realLength = getRealFromMidi(tempo, n.start + n.length) - realStart;
          
          const note = {
            pitch: n.pitch,
            start: realStart,
            length: realLength,
            next: null,
            color1: colors[0],
            color2: colors[1],
            vertexPosition: [
              (realStart + realLength * 0.5) * inv_xzoom,
              (n.pitch - brush.yoffset) * inv_yzoom,
            ],
            vertexScale: (realLength + brush.timeCurve1) * inv_xzoom * 2.0 + inv_yzoom,
          };

          const last = lastNotePerVoice[n.voice];
          if (brush.connectMode !== brushConnectModes.NONE &&
            last &&
            (note.start - (last.start + last.length)) < b.connectDistance)
          {
            last.next = note;
            const length = note.start + note.length - last.start;
            last.vertexPosition[0] = (last.start + length * 0.5) * inv_xzoom;
            last.vertexScale = Math.max(
              (length + brush.timeCurve1),
              Math.abs(note.pitch - last.pitch),
            ) * inv_xzoom * 2.0 + inv_yzoom;
          }
          lastNotePerVoice[n.voice] = note;

          brush.notes.push(note);
        }
      });

      //brush.notes = brush.notes.sort((a, b) => a.start - b.start);

      brushes.push(brush);
    });
  };

  function render(time) {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clear(gl.COLOR_BUFFER_BIT);

    brushes.forEach(b => {
      normalBrush.render(b, b.notes, time);
    });
  };

  return {
    load,
    render,
  };
};