const TempoGraph = (() => {
  'use strict';

  const e = React.createElement;

  const GraphHandle = ({ id, cx, cy, grab }) => e('circle', {
    cx, cy, r: 10,
    className: 'tempoHandle',
    onMouseDown: (e) => grab(id, e.target),
  });

  class TempoGraph extends React.Component {
    outside = React.createRef();
    inside = React.createRef();
    grabbed = -1;
    handle = null;

    getRealAndMidi(x, y) {
      const { scaleX, scaleY } = this.props;
      const { left, top, height } = this.inside.current.getBoundingClientRect();
      return {
        real: (x - left) / scaleX,
        midi: Math.floor((height + top - y) / scaleY),
      };
    }

    grab(id, handle) {
      this.grabbed = id;
      this.handle = handle;
    }

    onMouseMove(e) {
      if (this.grabbed === -1) return;

      const { left, top } = this.inside.current.getBoundingClientRect();

      this.handle.setAttribute('cx', e.clientX - left);
      this.handle.setAttribute('cy', e.clientY - top);
    }

    onMouseDown(e) {
      // create
    }

    onMouseUp(e) {
      if (this.grabbed === -1) return;
      
      const { moveTempoChange } = this.props;
      const { real, midi } = this.getRealAndMidi(e.clientX, e.clientY);

      moveTempoChange(this.grabbed, real, midi);

      this.grabbed = -1;
    }

    render() {
      const { changes, scaleX, scaleY } = this.props
      const { outside, inside } = this;

      const [ maxReal, maxMidi ] = changes.reduce((val, c) => [
        Math.max(val[0], c.real),
        Math.max(val[1], c.midi),
      ], [0, 0]);

      //const outsideRect = outside.current ? outside.current.getBoundingClientRect() : {width: 0, height: 0};
      const width = Math.max(maxReal * scaleX + 500, 500);
      const height = Math.max(maxMidi * scaleY + 500, 500);

      const points = changes.map(c => (
        `${c.real * scaleX},${height - c.midi * scaleY}`
      )).join(' ');

      const handles = changes.map(c => e(GraphHandle, {
        id: c.id,
        cx: c.real * scaleX,
        cy: height - c.midi * scaleY,
        grab: this.grab.bind(this),
        key: c.id,
      }));

      return e('div', {
        className: 'tempograph_outside',
        ref: outside,
      }, e('svg', {
        className: 'tempograph',
        ref: inside,
        width, height,
        onMouseMove: this.onMouseMove.bind(this),
        onMouseDown: this.onMouseDown.bind(this),
        onMouseUp: this.onMouseUp.bind(this),
      }, [
        e('polyline', {
          className: 'tempoLine',
          points,
          key: -1,
        }),
        ...handles
      ]));
    }
  }

  const mapStateToProps = state => ({
    changes: state.tempo,
    scaleX: state.tempoScaleX,
    scaleY: state.tempoScaleY,
  });

  const mapDispatchToProps = dispatch => ({
    moveTempoChange: (id, real, midi) =>
      dispatch({ type: 'UPDATE_TEMPO_CHANGE', id, tempoChange: { real, midi } }),
  });

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(TempoGraph);
})();