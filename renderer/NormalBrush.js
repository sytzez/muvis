const NormalBrush = (gl, vertexShader) => {
  'use strict';

  const source = `// GLSL fragment shader
#line 6

#define M_PI 3.1415926535897932384626433832795
#define FALSE 0
#define TRUE 1

#define SHAPE_RECT 1
#define SHAPE_CIRCLE 2
#define SHAPE_TRIANGLE 3
#define SHAPE_BLOB 4

#define PLAY_MASK 1 // color changes at current point
#define PLAY_FLIP 2 // whole note flips color at once
#define PLAY_ON_OFF 3 // flips color when played and flip back
#define PLAY_FLASH 4 // flip color and slowly change back

#define CONN_NONE 1
#define CONN_LINE 2 // connect through a line
#define CONN_FLOAT 3 // float whole note towards next note
#define CONN_BEND 4

precision lowp float;

uniform int u_shape;
uniform int u_play_mode;
uniform int u_conn_mode;
uniform int u_appear_back;

uniform vec2 u_scale;
uniform vec2 u_offset;

uniform float u_time; // current time
uniform vec2 u_curve; // time curvature

uniform vec3 u_note; // x: start, y: pitch, z: length
uniform vec2 u_size; // x: size, y: size curve
uniform vec3 u_next_note;

uniform vec3 u_color1;
uniform vec3 u_color2;

varying float v_size;
varying float v_inv_size;

float rect(const vec2 coord, const vec3 note, const float size) {
  if (coord.x < note.x || coord.x > note.x + note.z ||
    coord.y < note.y - size * 0.5 || coord.y > note.y + size * 0.5)
  {
    return 0.0;
  }
  return 1.0;
}

bool rectb(const vec2 coord, const vec3 note, const float size) {
  return !(coord.x < note.x || coord.x > note.x + note.z ||
    coord.y < note.y - size * 0.5 || coord.y > note.y + size * 0.5);
}

float triangle(const vec2 coord, const vec3 note, const float size) {
  if (!rectb(coord, note, size)) return 0.0;
  float width = (1.0 - (coord.x - note.x) / note.z) * size * 0.5;
  return clamp((width - abs(coord.y - note.y)) * 10.0, 0.0, 1.0);
}

float circle(const vec2 coord, const vec3 note, const float size) {
  if (!rectb(coord, note, size)) return 0.0;
  float center = note.x + note.z * 0.5;
  float x = (coord.x - center) / (note.z * 0.5);
  float y = (coord.y - note.y) / (size * 0.5);
  float dist = length(vec2(x, y));
  return clamp((1.0 - dist) * 10.0, 0.0, 1.0);
}

float blob(const vec2 coord, const vec3 note, const float size) {
  if (!rectb(coord, note, size)) return 0.0;
  float center = note.x + note.z * 0.5;
  float x = (coord.x - center) / (note.z * 0.5);
  float y = (coord.y - note.y) / (size * 0.5);
  float dist = length(vec2(x, y));
  return clamp((1.0 - dist), 0.0, 1.0);
}

void main() {
  vec2 coord = (gl_FragCoord.xy * u_scale) + u_offset;

  if (u_curve.y != 1.0) {
    coord.x -= u_time;
    coord.x /= u_curve.x;

    if (coord.x <= -1.0) {
      coord.x += 1.0 - u_curve.y;
    } else if (coord.x < 1.0) {
      coord.x *= u_curve.y; // += cos
    } else {
      coord.x -= 1.0 - u_curve.y;
    }

    coord.x *= u_curve.x;
    coord.x += u_time;
  }

  vec3 note = u_note;

  float opacity = 1.0;

  if (u_next_note.x != 0.0) {
    if (u_conn_mode == CONN_LINE) {

    } else if (u_conn_mode == CONN_BEND) {
      if (coord.x > note.x)
        note.y += (u_next_note.y - note.y) * (coord.x - note.x) / (u_next_note.x - note.x);
    } else if (u_conn_mode == CONN_FLOAT) {
      if (u_time > u_next_note.x) {
        if (u_appear_back == FALSE) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
          return;
        }
      } else if (u_time > note.x) {
        float transition = (u_time  - note.x) / (u_next_note.x - note.x);
        note.x += (u_next_note.x - note.x) * transition;
        note.y += (u_next_note.y - note.y) * pow(transition, 1.5);
        note.z += (u_next_note.z - note.z) * transition;
        opacity = 1.0 - pow(transition, 2.0);
      }
    }
  }

  #define RENDER(func) {` +
    `val = func(coord, note, v_size) * opacity;` +
    `if (u_appear_back == TRUE) {` +
      `val = max(val, func(coord, u_note, u_size.x) * (1.0 - opacity));` +
    `}` +
  `}

  float val;

  if (u_shape == SHAPE_RECT) RENDER(rect)
  else if (u_shape == SHAPE_TRIANGLE) RENDER(triangle)
  else if (u_shape == SHAPE_CIRCLE) RENDER(circle)
  else if (u_shape == SHAPE_BLOB) RENDER(blob)
  else return;

  if (val == 0.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    return;
  }

  vec3 color;

  if (u_play_mode == PLAY_MASK) {
    if (coord.x - (note.x - u_note.x) > u_time)
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

  gl_FragColor = vec4(color, val);
}`; // end of GLSL shader

  const shader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  console.log(gl.getShaderInfoLog(shader));

  const prog = gl.createProgram();
  gl.attachShader(prog, shader);
  gl.attachShader(prog, vertexShader);
  gl.linkProgram(prog);
  console.log(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);

  const a_position = gl.getAttribLocation(prog, 'a_position');

  const u = name => gl.getUniformLocation(prog, name),
    u_vertexPosition = u('u_vertex_position'),
    u_vertexScale = u('u_vertex_scale'),
    u_playMode = u('u_play_mode'),
    u_shape = u('u_shape'),
    u_connMode = u('u_conn_mode'),
    u_appearBack = u('u_appear_back'),
    u_scale = u('u_scale'),
    u_offset = u('u_offset'),
    u_time = u('u_time'),
    u_curve = u('u_curve'),
    u_note = u('u_note'),
    u_size = u('u_size'),
    u_nextNote = u('u_next_note'),
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

    gl.uniform2f(u_size, ...brush.size);
    gl.uniform1i(u_playMode, brush.playMode);
    gl.uniform1i(u_shape, brush.shape);
    gl.uniform1i(u_connMode, brush.connectMode);
    gl.uniform1i(u_appearBack, brush.appearBack);
    gl.uniform2f(u_curve, brush.timeCurve1, brush.timeCurve2);

    gl.enableVertexAttribArray(a_position);
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, square);

    const leftBound = brush.xoffset + time;
    const rightBound = brush.xoffset + time + brush.xzoom;

    const i = notes[Symbol.iterator]();
    let nxt;

    // iterate towards the first note in view
    for(nxt = i.next();
      nxt.done !== true && (
        nxt.value.next ?
          (nxt.value.next.start + nxt.value.next.length < leftBound) :
          (nxt.value.start + nxt.value.length < leftBound)
      ); nxt = i.next());
    
    const inv_xzoom = 2.0 / brush.xzoom;
    const inv_yzoom = 2.0 / brush.yzoom;

    for(;nxt.done !== true && nxt.value.start < rightBound;
      nxt = i.next())
    { // TODO: put whole note into one datastructure, at load()
      const note = nxt.value;
      const nextNote = note.next;

      if (brush.connectMode !== brushConnectModes.NONE && nextNote &&
        time >= note.start && time <= nextNote.start + nextNote.length) {
        gl.uniform2f(u_vertexPosition,
          note.vertexPositionPlaying[0] - leftBound * inv_xzoom - 1.0,
          note.vertexPositionPlaying[1] - 1.0,
        );
        gl.uniform1f(u_vertexScale, note.vertexScalePlaying);
      } else {
        gl.uniform2f(u_vertexPosition,
          note.vertexPosition[0] - leftBound * inv_xzoom - 1.0,
          note.vertexPosition[1] - 1.0,
        );
        gl.uniform1f(u_vertexScale, note.vertexScale);
      }

      gl.uniform3f(u_note, note.start, note.pitch, note.length);
      gl.uniform3f(u_color1, ...note.color1);
      gl.uniform3f(u_color2, ...note.color2);
      if (brush.connectMode !== brushConnectModes.NONE) {
        if (nextNote)
          gl.uniform3f(u_nextNote, nextNote.start, nextNote.pitch, nextNote.length);
        else
          gl.uniform3f(u_nextNote, 0.0, 0.0, 0.0);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  };

  function destroy() {
    gl.deleteProgram(prog);
    gl.deleteShader(shader);
    gl.deleteBuffer(square);
  }

  return { render, destroy };
};