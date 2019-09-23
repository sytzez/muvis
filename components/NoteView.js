const NoteView = (() => {
  'use strict';

  const e = React.createElement;

  class NoteView extends React.Component {
    internal = {
      outerDiv: React.createRef(),
      innerDiv: React.createRef(),
      mouseMoveCallback: null,
      mouseUpCallback: null,
    }

    last = {
      noteIdCounter: 0,
    }

    state = {
      leftTimeBound: 0,
      rightTimeBound: 0,
    }

    componentDidMount() {
      const { outerDiv, innerDiv } = this.internal;
      outerDiv.current.scrollTop = this.props.scaleY * this.props.pitchTop;
      this.updateTimeBounds();
    }

    shouldComponentUpdate(nextProps, nextState) {
      if (
        this.state.leftTimeBound !== nextState.leftTimeBound ||
        this.state.rightTimeBound !== nextState.rightTimeBound ||
        this.props.scaleX !== nextProps.scaleX ||
        this.last.noteIdCounter !== noteIdCounter || // redundant?
        this.props.notes.length !== nextProps.notes.length
      ) return true;
      
      //if (this.props.notes !== nextProps.notes) return true; 
      //if (notes.some(n => !nextNotes.some(n2 => n.id === n2.id))) return true;

      console.log('skip rerender');
      return false;
    }
    
    setMouseCallback(move, up) {
      if (this.internal.mouseUpCallback) {
        this.internal.mouseUpCallback();
      }
      this.internal.mouseMoveCallback = move;
      this.internal.mouseUpCallback = up;
    }

    removeMouseCallback() {
      this.internal.mouseMoveCallback = null;
      this.internal.mouseUpCallback = null;
    }

    getTimeAndPitch(x, y) {
      const { scaleX, scaleY } = this.props;
      const { left, top } = this.internal.innerDiv.current.getBoundingClientRect();
      return {
        time: Math.floor((x - left) / scaleX),
        pitch: Math.floor((y - top) / scaleY),
      };
    }

    insertNoteAtPoint(x, y) {
      const { insertNote, brush, voice, scaleX } = this.props;
      const { time, pitch } = this.getTimeAndPitch(x, y);
      insertNote({
        start: time,
        pitch: pitch,
        length: Math.ceil(30 / scaleX),
        voice: voice,
        brush: brush,
      });
    }

    updateTimeBounds() {
      const { scaleX } = this.props;
      const { leftTimeBound, rightTimeBound } = this.state;
      const { outerDiv } = this.internal;
      const div = outerDiv.current;

      const viewLeft = Math.floor(div.scrollLeft / scaleX);

      const { width } = div.getBoundingClientRect();
      const viewRight = viewLeft + Math.floor(width / scaleX);

      if (viewLeft < leftTimeBound || viewRight > rightTimeBound) {
        const extraBound = Math.floor(500 / scaleX);
        this.setState({
          leftTimeBound: viewLeft - extraBound,
          rightTimeBound: viewRight + extraBound,
        });
      }
    }

    onMouseDown(e) {
      const { editMode } = this.props;

      if (editMode === editModes.NOTES) {
        if (e.button === 0)
          this.insertNoteAtPoint(e.clientX, e.clientY);
      }
    }

    onMouseUp(e) {
      const callback = this.internal.mouseUpCallback;
      if (callback) callback(e);
    }

    onMouseMove(e) {
      const callback = this.internal.mouseMoveCallback;
      if (callback) callback(e);
    }

    onScroll(e) {
      this.updateTimeBounds();
    }

    onWheel(e) {
      if (e.ctrlKey) {
        //e.preventDefault();
        // TODO resize
      }
    }

    render() {
      console.log('nv rerender');

      const { notes, scaleX, scaleY } = this.props;

      const { innerDiv, outerDiv } = this.internal;

      const {
        leftTimeBound, rightTimeBound
      } = this.state;

      this.last.noteIdCounter = noteIdCounter;

      let fullWidth = window.innerWidth;

      const noteElements = [];

      for(let i = 0; i < notes.length; i++) {
        const n = notes[i];
        const end = n.start + n.length;
        fullWidth = Math.max(fullWidth, end * scaleX + 500);
        if (n.start < rightTimeBound && end > leftTimeBound)
          noteElements.push(e(Note, { id: n.id, key: n.id, noteview: this }));
      }

      const pitchTopBar = e(PitchRangeBars.Top, {
        noteview: this,
        w: fullWidth,
        key: -1,
      });

      const pitchBotBar = e(PitchRangeBars.Bottom, {
        noteview: this,
        w: fullWidth,
        key: -2,
      });

      return e('div', {
        className: 'noteview',
        id: 'noteview',
        ref: outerDiv,
        onScroll: this.onScroll.bind(this),
      }, e('div', {
        className: 'noteview_inside',
        id: 'noteview_inside',
        ref: innerDiv,
        style: {
          width: fullWidth,
          height: 128 * scaleY,
        },
        onMouseDown: this.onMouseDown.bind(this),
        onContextMenu: (e) => {
          e.preventDefault();
        },
        onMouseUp: this.onMouseUp.bind(this),
        onWheel: this.onWheel.bind(this),
        onMouseMove: this.onMouseMove.bind(this),
        // //onClick: (e) => this.onClick(e),
        // onMouseDown: (e) => this.onPress(e),
        // onMouseUp: (e) => this.onRelease(e),
        // onMouseMove: (e) => this.onMouseMove(e),
      }, [
        pitchTopBar,
        pitchBotBar,
        ...noteElements,
      ]));
    }
  }

  const mapStateToProps = state => ({
    notes: state.notes,
    editMode: state.editMode,
    brush: state.selectedBrush,
    voice: state.selectedVoice,
    scaleX: state.scaleX,
    scaleY: state.scaleY,
    pitchTop: state.pitchTop,
    pitchBot: state.pitchBot,
  });

  const mapDispatchToProps = dispatch => ({
    insertNote: (note) => dispatch({ type: 'INSERT_NOTE', note }),
  });

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(NoteView);
})();