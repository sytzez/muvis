const NormalBrush = (gl, vertexShader) => {
  'use strict';

  const source = `// GLSL fragment shader
#line 6

#define M_PI 3.1415926535897932384626433832795

#define SHAPE_RECT 1
#define SHAPE_CIRCLE 2
#define SHAPE_TRIANGLE 3

#define PLAY_MASK 1 // color changes at current point
#define PLAY_FLIP 2 // whole note flips color at once
#define PLAY_ON_OFF 3 // flips color when played and flip back
#define PLAY_FLASH 4 // flip color and slowly change back

precision lowp float;

uniform int u_play_mode;
uniform int u_shape;

uniform vec2 u_scale;
uniform vec2 u_offset;

uniform float u_time; // current time
uniform vec2 u_curve; // time curvature

uniform vec3 u_note; // x: start, y: pitch, z: length

uniform vec3 u_color1;
uniform vec3 u_color2;

float rect(const vec2 coord) {
  if (coord.x < u_note.x || coord.x > u_note.x + u_note.z ||
    coord.y < u_note.y - 0.5 || coord.y > u_note.y + 0.5)
  {
    return 0.0;
  }
  return 1.0;
}

float triangle(const vec2 coord) {
  return 0.0;
}

void main() {
  vec2 coord = (gl_FragCoord.xy * u_scale) + u_offset;

  coord.x -= u_time;
  coord.x /= u_curve.x;

  if (coord.x <= -1.0) {
    coord.x += 1.0 - u_curve.y;
  } else if (coord.x < 1.0) {
    coord.x *= u_curve.y; // += cos
  } else {
    coord.x -= 1.0 - u_curve.y;
  }

  // if (coord.x > -1.0 && coord.x < 1.0)
  //   coord.x -= sin(coord.x * M_PI) * exp(-1.5 / (1.0 - coord.x*coord.x));

  coord.x *= u_curve.x;
  coord.x += u_time;

  //coord.x = pow((coord.x - u_time) * 0.03, 3.0) + u_time;

  float val;
  if (u_shape == SHAPE_RECT) {
    val = rect(coord);
  } else {
    return;
  }

  if (val == 0.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    return;
  }

  vec3 color;

  if (u_play_mode == PLAY_MASK) {
    if (coord.x > u_time)
      color = u_color1;
    else
      color = u_color2;
  } else if (u_play_mode == PLAY_FLIP) {
    if (u_note.x > u_time)
      color = u_color1;
    else
      color = u_color2;
  } else if (u_play_mode == PLAY_ON_OFF) {
    if (u_note.x  > u_time || u_note.x + u_note.z < u_time)
      color = u_color1;
    else
      color = u_color2;
  } else if (u_play_mode == PLAY_FLASH) {
    if (u_note.x  > u_time || u_note.x + u_note.z < u_time)
      color = u_color1;
    else
      color = mix(u_color2, u_color1, (u_time - u_note.x) / u_note.z);
  } else {
    color = u_color1;
  }

  gl_FragColor = vec4(color * val, val);
}`; // end of GLSL shader

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

  const u = name => gl.getUniformLocation(prog, name),
    u_playMode = u('u_play_mode'),
    u_shape = u('u_shape'),
    u_scale = u('u_scale'),
    u_offset = u('u_offset'),
    u_time = u('u_time'),
    u_curve = u('u_curve'),
    u_note = u('u_note'),
    u_color1 = u('u_color1'),
    u_color2 = u('u_color2');

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
    gl.uniform1f(u_time, time);

    gl.uniform1i(u_playMode, brush.playMode);
    gl.uniform1i(u_shape, brush.shape);
    gl.uniform2f(u_curve, brush.timeCurve1, brush.timeCurve2);

    gl.enableVertexAttribArray(a_position);
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, square);

    const leftBound = brush.xoffset + time;
    const rightBound = brush.xoffset + time + brush.xzoom;

    const i = notes[Symbol.iterator]();
    let nxt;

    for(nxt = i.next();
      nxt.done !== true && nxt.value.start + nxt.value.length < leftBound;
      nxt = i.next());

    for(;nxt.done !== true && nxt.value.start < rightBound;
      nxt = i.next())
    { // TODO: put whole note into one datastructure, at load()
      const note = nxt.value;
      gl.uniform3f(u_note, note.start, note.pitch, note.length);
      gl.uniform3f(u_color1, ...note.color1);
      gl.uniform3f(u_color2, ...note.color2);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  };

  return { render };
};