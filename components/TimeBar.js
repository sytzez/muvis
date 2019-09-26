const TimeBar = (() => {
  class TimeBar extends React.Component {
    ref = React.createRef();
    timeCallback = this.onTime.bind(this);

    onMouseMove(e) {
      const { noteview, tempo } = this.props;
      const { time } = noteview.getTimeAndPitch(e.clientX, e.clientY);
      hotPlayback.setTime(getRealFromMidi(tempo, time));
    }

    onMouseUp(e) {
      const { noteview } = this.props;
      noteview.removeMouseCallback();
    }

    onTime(t) {
      const { tempo, scaleX } = this.props;
      this.ref.current.style.left =
        getMidiFromReal(tempo, t) * scaleX;
    }

    componentDidMount() {
      hotPlayback.addListener(this.timeCallback);
    }

    componentWillUnmount() {
      hotPlayback.removeListener(this.timeCallback);
    }

    render() {
      const { time, scaleX, tempo, h, noteview } = this.props;

      return React.createElement('div', {
        className: 'verticalLine',
        ref: this.ref,
        draggable: 'false',
        style: {
          left: getMidiFromReal(tempo, hotPlayback.getTime()) * scaleX,
          height: h,
        },
        onMouseDown: (e) => {
          if (e.button === 0) {
            e.stopPropagation();
            noteview.setMouseCallback(
              this.onMouseMove.bind(this),
              this.onMouseUp.bind(this),
            );
          }
        },
      })
    }
  }

  const mapStateToProps = state => ({
    scaleX: state.scaleX,
    tempo: state.tempo,
    time: state.playback.time,
  });

  return ReactRedux.connect(
    mapStateToProps,
  )(TimeBar);
})();