const TempoGraph = (() => {
  'use strict';

  const e = React.createElement;

  const GraphHandle = ({ id, cx, cy, grab, remove }) => e('circle', {
    cx, cy, r: 10,
    className: 'tempoHandle',
    onMouseDown: (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.button === 0 && !e.altKey)
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
    midiBar = React.createRef();
    realBar = React.createRef();
    grabbed = -1;
    lastScrollY = 0;
    timeListener = this.time.bind(this);
    height = 0;
    lastDispatch = 0;
    zoomFix = false;
    zoomReal = 0;
    zoomMidi = 0;
    zoomX = 0;
    zoomY = 0;

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
      const { scaleX, scaleY } = this.props;
      const { changes } = this.state;
      const { midiBar, realBar, height } = this;

      realBar.current.setAttribute('x1', t * scaleX);
      realBar.current.setAttribute('x2', t * scaleX);

      const midi = getMidiFromReal(changes, t);

      midiBar.current.setAttribute('y1', height - midi * scaleY);
      midiBar.current.setAttribute('y2', height - midi * scaleY);
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

    move(x, y) {
      const now = performance.now();
      const dispatch = now > this.lastDispatch + 100;
      if (dispatch) this.lastDispatch = now;

      const { real, midi } = this.getRealAndMidi(x, y);
      this.setChange(this.grabbed, real, midi, dispatch);
    }

    putTime(x) {
      const { real } = this.getRealAndMidi(x, 0);
      hotPlayback.setTime(real);
    }

    onMouseMove(e) {
      if (this.grabbed !== -1) this.move(e.clientX, e.clientY);
      
      const buttons = e.buttons !== undefined ? e.buttons : e.nativeEvent.which;
      if (buttons === 1 && e.altKey) this.putTime(e.clientX);
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
      if (e.button === 0 && !e.altKey)
        this.insert(e.clientX, e.clientY);
      else if (e.button === 0 && e.altKey)
        this.putTime(e.clientX);
    }

    onMouseUp(e) {
      if (this.grabbed === -1) return;
      
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
      const mega = 1000;
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
      this.lastScrollY = this.height - this.outside.current.scrollTop;
    }

    onWheel(e) {
      if (!e.ctrlKey) return;
      
      const { real, midi } = this.getRealAndMidi(e.clientX, e.clientY);
      const { setScale, scaleX, scaleY } = this.props;

      const factor = Math.SQRT2 * (e.deltaY < 0 ? 1.0 : 0.5);
      setScale(scaleX * factor, scaleY * factor);

      this.zoomFix = true;
      this.zoomX = e.clientX;
      this.zoomY = e.clientY;
      this.zoomReal = real;
      this.zoomMidi = midi;
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

      const outsideRect = outside.current ?
        outside.current.getBoundingClientRect() : {width: 1000, height: 1000};
      const width = maxReal * scaleX + outsideRect.width;
      const height = maxMidi * scaleY + outsideRect.height;
      this.height = height;

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

      const time = hotPlayback.getTime();
      const realBar = e('line', {
        className: 'tempoLine3',
        ref: this.realBar,
        x1: time * scaleX, y1: 0,
        x2: time * scaleX, y2: height,
        key: -2,
      });

      const midi = getMidiFromReal(changes, time);
      const midiBar = e('line', {
        className: 'tempoLine3',
        ref: this.midiBar,
        x1: 0,
        y1: height - midi * scaleY,
        x2: width, 
        y2: height - midi * scaleY,
        key: -3,
      })

      if (outside.current) {
        if (this.zoomFix) {
          const { zoomX, zoomY, zoomMidi, zoomReal } = this;
          const { top, left } = outside.current.getBoundingClientRect();
          outside.current.scrollLeft = (zoomReal * scaleX) - zoomX + left;
          outside.current.scrollTop = height - (zoomMidi * scaleY) - zoomY + top;
          this.zoomFix = false;
          this.lastScrollY = height - outside.current.scrollTop;
        } else {
          outside.current.scrollTop = height - this.lastScrollY;
        }
      }

      return e('div', {
        className: 'tempograph_outside',
        ref: outside,
        onScroll: this.onScroll.bind(this),
        onWheel: this.onWheel.bind(this),
      }, e('svg', {
        className: 'tempograph',
        ref: inside,
        width, height,
        onMouseMove: this.onMouseMove.bind(this),
        onMouseDown: this.onMouseDown.bind(this),
        onMouseUp: this.onMouseUp.bind(this),
        onContextMenu: (e) => e.preventDefault(),
      }, [
        realBar,
        midiBar,
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
    setScale: (x, y) =>
      dispatch({ type: 'SET_TEMPO_SCALE', tempoScaleX: x, tempoScaleY: y }),
  });

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(TempoGraph);
})();