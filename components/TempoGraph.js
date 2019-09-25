const TempoGraph = (() => {
  'use strict';

  const e = React.createElement;

  const GraphHandle = ({ id, cx, cy, grab, remove }) => e('circle', {
    cx, cy, r: 10,
    className: 'tempoHandle',
    onMouseDown: (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.button === 0)
        grab(id);
      else if (e.button === 2)
        remove(id);
    },
    onMouseEnter: (e) => {
      const buttons = e.buttons !== undefined ? e.buttons : e.nativeEvent.which;
      if (buttons === 2)
        remove(id);
    },
  });

  class TempoGraph extends React.Component {
    outside = React.createRef();
    inside = React.createRef();
    grabbed = -1;
    lastScrollY = 0;
    timeListener = this.time.bind(this);

    state = {
      lastChanges: {},
      changes: {},
    }

    getRealAndMidi(x, y) {
      const { scaleX, scaleY } = this.props;
      const { left, top, height } = this.inside.current.getBoundingClientRect();
      return {
        real: (x - left) / scaleX,
        midi: Math.floor((height + top - y) / scaleY),
      };
    }

    time(t) {
      console.log(t);
    }

    grab(id) {
      this.grabbed = id;
    }

    remove(id) {
      const { changes } = this.state;
      const { removeTempoChange } = this.props;
      if (changes.length === 2) return;
      removeTempoChange(id);
    }

    insert(x, y) {
      const { insertTempoChange } = this.props;
      const { real, midi } = this.getRealAndMidi(x, y);
      insertTempoChange(real, midi);
      this.grabbed = tempoIdCounter - 1;
    }

    onMouseMove(e) {
      if (this.grabbed === -1) return;
      const { real, midi } = this.getRealAndMidi(e.clientX, e.clientY);
      this.setChange(this.grabbed, real, midi);
    }

    setChange(id, real, midi, dispatch = false) {
      const { changes } = this.state;
      const i = changes.findIndex(c => c.id === id);
      if (i === -1) return;

      const { moveTempoChange } = this.props;

      if (i < changes.length - 1) {
        const next = changes[i + 1];
        real = Math.min(real, next.real - 0.01);
        midi = Math.min(midi, next.midi - 1);
      }

      if (i !== 0) {
        const prev = changes[i - 1];
        real = Math.max(real, prev.real + 0.01);
        midi = Math.max(midi, prev.midi + 1);
      }

      if (dispatch)
        moveTempoChange(id, real, midi);
      else
        this.setState({
          changes: changes.map(c => c.id === id ?
            { ...c, real, midi } : c),
        });
    }

    onMouseDown(e) {
      if (e.button === 0)
        this.insert(e.clientX, e.clientY);
    }

    onMouseUp(e) {
      if (this.grabbed === -1) return;
      
      const { moveTempoChange } = this.props;
      const { real, midi } = this.getRealAndMidi(e.clientX, e.clientY);
      this.setChange(this.grabbed, real, midi, true);

      this.grabbed = -1;
    }

    static getDerivedStateFromProps(props, state) {
      return (props.changes !== state.lastChanges) ? {
        lastChanges: props.changes,
        changes: props.changes,
      } : null
    }

    static renderInfiniteLine(x1, y1, x2, y2, w, h, key) {
      const mega = 100;
      let dx = (x2 - x1) * mega;
      let dy = (y2 - y1) * mega;

      let factor = 1;

      if (x2 + dx < 0)
        factor = Math.min(factor, -x2 / dx);
      if (y2 + dy < 0) 
        factor = Math.min(factor, -y2 / dy);
      if (x2 + dx > w)
        factor = Math.min(factor, (w - x2) / dx);
      if (y2 + dy > h)
        factor = Math.min(factor, (h - y2) / dy);
      
      return e('line', {
        className: 'tempoLine2',
        x1, y1,
        x2: x2 + dx * factor,
        y2: y2 + dy * factor,
        key,
      });
    }

    onScroll() {
      this.lastScrollY =
        this.inside.current.getAttribute('height') - 
        this.outside.current.scrollTop;
    }

    componentDidMount() {
      this.outside.current.scrollTop =
        this.inside.current.getAttribute('height') -
        this.outside.current.getAttribute('height');

      hotPlayback.addListener(this.timeListener);
    }

    componentWillUnmount() {
      hotPlayback.removeListener(this.timeListener);
    }

    render() {
      const { changes } = this.state;
      const { scaleX, scaleY } = this.props
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
        remove: this.remove.bind(this),
        key: c.id,
      }));
      
      const first = changes[0];
      const second = changes[1];
      const infiniteLine1 = this.constructor.renderInfiniteLine(
        second.real * scaleX,
        height - second.midi * scaleY,
        first.real * scaleX,
        height - first.midi * scaleY,
        width, height,
        -10,
      );

      const last = changes[changes.length - 1];
      const secondLast = changes[changes.length - 2];
      const infiniteLine2 = this.constructor.renderInfiniteLine(
        secondLast.real * scaleX,
        height - secondLast.midi * scaleY,
        last.real * scaleX,
        height - last.midi * scaleY,
        width, height,
        -11,
      );

      const realBar = e('div',
      )

      if (outside.current) {
        outside.current.scrollTop = height - this.lastScrollY;
      }

      return e('div', {
        className: 'tempograph_outside',
        ref: outside,
        onScroll: this.onScroll.bind(this),
      }, e('svg', {
        className: 'tempograph',
        ref: inside,
        width, height,
        onMouseMove: this.onMouseMove.bind(this),
        onMouseDown: this.onMouseDown.bind(this),
        onMouseUp: this.onMouseUp.bind(this),
        onContextMenu: (e) => e.preventDefault(),
      }, [
        infiniteLine1,
        infiniteLine2,
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
    insertTempoChange: (real, midi) =>
      dispatch({ type: 'INSERT_TEMPO_CHANGE', tempoChange: { real, midi } }),
    moveTempoChange: (id, real, midi) =>
      dispatch({ type: 'UPDATE_TEMPO_CHANGE', id, tempoChange: { real, midi } }),
    removeTempoChange: (id) =>
      dispatch({ type: 'REMOVE_TEMPO_CHANGE', id }),
  });

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(TempoGraph);
})();