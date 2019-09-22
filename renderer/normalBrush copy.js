const NormalBrush = (gl, vertexShader) => {
  'use strict';

  const source = `// fragment shader
#define SHAPE_RECT 1
#define SHAPE_CIRCLE 2
#define SHAPE_TRIANGLE 3

#define PLAY_MASK 1 // color changes at current point
#define PLAY_FLIP 2 // whole note flips color at once
#define PLAY_ON_OFF 3 // flips color when played and flip back

#define SQUARE

precision lowp float;

uniform int u_play_mode;

uniform vec2 u_scale;
uniform vec2 u_offset;

uniform float u_pitch; // TODO transform into 3f struct
uniform float u_start;
uniform float u_length;

uniform vec3 u_color1;
uniform vec3 u_color2;

void main() {
  vec2 coord = (gl_FragCoord.xy * u_scale) + u_offset;

#ifdef OVAL
  // vec2 center = vec2(u_start, u_pitch);
  // vec2 temp = coord - center;
  // temp.x /= u_length;
  // float dist = length(temp);
  
  // vec2 realcenter = (center - u_offset) / u_scale;
  // float realdist = distance(gl_FragCoord.xy, realcenter);

  // float reallinedist = realdist / dist;
  // float linepart = 2.0 / reallinedist;

  // if (realdist < reallinedist - 2.0 || realdist > reallinedist + 2.0) {
  //   gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
  //   return;
  // }
  vec2 center = vec2(u_start, u_pitch);

  vec2 realcenter = (center - u_offset) / u_scale;
  float a = u_length / u_scale.x;
  float b = 1.0 / u_scale.y;
  float c = sqrt(abs(a*a - b*b));

  vec2 foc1 = vec2(realcenter.x - c, realcenter.y);
  vec2 foc2 = vec2(realcenter.x + c, realcenter.y);

  float angle = (atan(gl_FragCoord.xy - foc1) + atan(gl_FragCoord.xy - foc2)) * 0.5
#endif

#ifdef SQUARE
  if (coord.x < u_start || coord.x > u_start + u_length ||
    coord.y < u_pitch - 0.5 || coord.y > u_pitch + 0.5)
  {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    return;
  }
#endif

  vec3 color;
  if (u_play_mode == PLAY_MASK) {

  } else if (u_play_mode == PLAY_FLIP) {

  } else if (u_play_mode == PLAY_ON_OFF) {

  } else {
    color = u_color1;
  }

  gl_FragColor = vec4(color, 1.0);
}`;

  const shader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  console.log(gl.getShaderInfoLog(shader));

  const prog = gl.createProgram();
  gl.attachShader(prog, shader);
  gl.attachShader(prog, vertexShader);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const a_position = gl.getAttribLocation(prog, 'a_position');
  const u_playMode = gl.getUniformLocation(prog, 'u_play_mode');
  const u_scale = gl.getUniformLocation(prog, 'u_scale');
  const u_offset = gl.getUniformLocation(prog, 'u_offset');
  const u_pitch = gl.getUniformLocation(prog, 'u_pitch');
  const u_start = gl.getUniformLocation(prog, 'u_start');
  const u_length = gl.getUniformLocation(prog, 'u_length');
  const u_color1 = gl.getUniformLocation(prog, 'u_color1');
  const u_color2 = gl.getUniformLocation(prog, 'u_color2');

  const square = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, square);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1.0,-1.0, 1.0,-1.0, -1.0,1.0,
    -1.0,1.0 ,1.0,-1.0, 1.0,1.0,
  ]), gl.STATIC_DRAW);

  function render(brush, notes, time) {
    gl.useProgram(prog);

    gl.uniform2f(u_scale, brush.xzoom / gl.drawingBufferWidth,
      brush.yzoom / gl.drawingBufferHeight);
    gl.uniform2f(u_offset, brush.xoffset + time, brush.yoffset);

    gl.enableVertexAttribArray(a_position);
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, square);

    const leftBound = brush.xoffset;
    const rightBound = brush.xoffset + brush.xzoom;

    const i = notes[Symbol.iterator]();
    let nxt;

    for(nxt = i.next();
      nxt.done !== true && nxt.value.start < leftBound;
      nxt = i.next());

    for(;nxt.done !== true && nxt.value.start < rightBound;
      nxt = i.next())
    {
      const note = nxt.value;
      gl.uniform1f(u_pitch, note.pitch);
      gl.uniform1f(u_start, note.start);
      gl.uniform1f(u_length, note.length);
      gl.uniform3f(u_color1, ...note.color1);
      gl.uniform3f(u_color2, ...note.color2);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  };

  return { render };
};