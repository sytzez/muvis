const PitchRangeBars = (() => {
  class PitchRangeBar extends React.Component {
    ref = React.createRef();
    newPitch = 0;

    onMouseMove(e) {
      const { noteview, scaleY } = this.props;

      const { pitch } = noteview.getTimeAndPitch(e.clientX, e.clientY);

      this.newPitch = pitch;
      this.ref.current.style.top = this.newPitch * scaleY;
    }

    onMouseUp(e) {
      const { noteview, setPitch } = this.props;
      
      if (e) {
        const { pitch } = noteview.getTimeAndPitch(e.clientX, e.clientY);
        this.newPitch = pitch;
      }

      noteview.removeMouseCallback();
      setPitch(this.newPitch);
    }

    render() {
      const { pitch, scaleY, w, noteview } = this.props;
      this.newPitch = pitch;

      return React.createElement('div', {
        className: 'verticalLine',
        ref: this.ref,
        style: {
          top: pitch * scaleY,
          width: w,
        },
        onMouseDown: (e) => {
          if (e.button = 1) {
            e.stopPropagation();
            noteview.setMouseCallback(
              this.onMouseMove.bind(this),
              this.onMouseUp.bind(this),
            );
          }
        },
        onDragStart: () => false,
      });
    }
  }

  const Top = ReactRedux.connect(
    state => ({
      pitch: state.pitchTop,
      scaleY: state.scaleY,
    }),
    dispatch => ({
      setPitch: (pitch) => dispatch({ type: 'SET_PITCH_TOP', pitch }),
    }),
  )(PitchRangeBar);
  
  const Bottom = ReactRedux.connect(
    state => ({
      pitch: state.pitchBottom,
      scaleY: state.scaleY,
    }),
    dispatch => ({
      setPitch: (pitch) => dispatch({ type: 'SET_PITCH_BOTTOM', pitch }),
    }),
  )(PitchRangeBar);
  
  return { Top, Bottom };
})();