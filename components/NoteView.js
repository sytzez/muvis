const NoteView = (() => {
  'use strict';

  const e = React.createElement;

  class NoteView extends React.Component {
    internal = {
      outerDiv: React.createRef(),
      innerDiv: React.createRef(),
      selectDiv: React.createRef(),
      mouseMoveCallback: null,
      mouseUpCallback: null,
    }

    selectBox = null

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
        this.props.notes !== nextProps.notes
        //this.last.noteIdCounter !== noteIdCounter || // redundant?
        //this.props.notes.length !== nextProps.notes.length
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

    startSelectBox(x, y, shift) {
      const { left, top } = this.internal.innerDiv.current.getBoundingClientRect();
      this.selectBox = {
        x: x - left,
        y: y - top,
        shift,
      };
    }

    updateSelectBox(x, y) {
      const { left, top } = this.internal.innerDiv.current.getBoundingClientRect();
      const { style } = this.internal.selectDiv.current;
      style.left = Math.min(this.selectBox.x, x - left);
      style.top = Math.min(this.selectBox.y, y - top);
      style.width = Math.abs(this.selectBox.x - (x - left));
      style.height = Math.abs(this.selectBox.y - (y - top));
      this.internal.selectDiv.current.hidden = false;
    }

    finishSelectBox(x, y) {
      this.updateSelectBox(x, y);

      const { scaleX, scaleY, notes, visibleBrushes, visibleVoices,
        selectNotes, shiftSelectNotes } = this.props;
      const { style } = this.internal.selectDiv.current;

      const left = Math.floor(parseInt(style.left) / scaleX);
      const top = Math.floor(parseInt(style.top) / scaleY);
      const right = Math.ceil((parseInt(style.left) + parseInt(style.width)) / scaleX);
      const bottom = Math.ceil((parseInt(style.top) + parseInt(style.height)) / scaleY);

      const selection = notes.filter(n => (
        n.start > left && n.start + n.length < right &&
        n.pitch > top && n.pitch < bottom - 1 &&
        (n.brush === -1 || visibleBrushes.includes(n.brush)) &&
        visibleVoices.includes(n.voice)
      )).map(n => n.id);
      
      if (this.selectBox.shift)
        shiftSelectNotes(selection);
      else
        selectNotes(selection);

      this.selectBox = null;
      this.internal.selectDiv.current.hidden = true;
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
      const { editMode, deselectAll } = this.props;

      if (e.ctrlKey) {
        if (editMode === editModes.NOTES) {
          if (e.button === 0)
            this.insertNoteAtPoint(e.clientX, e.clientY);
        }
      } else {
        if (e.button === 0) {
          if (!e.shiftKey) deselectAll();
          this.startSelectBox(e.clientX, e.clientY, e.shiftKey);
        }
      }
    }

    onMouseUp(e) {
      const callback = this.internal.mouseUpCallback;
      if (callback) callback(e);

      if (this.selectBox) this.finishSelectBox(e.clientX, e.clientY);
    }

    onMouseMove(e) {
      const callback = this.internal.mouseMoveCallback;
      if (callback) callback(e);
      
      const select = this.selectBox;
      if (select) this.updateSelectBox(e.clientX, e.clientY);
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

      const { innerDiv, outerDiv, selectDiv } = this.internal;

      const {
        leftTimeBound, rightTimeBound
      } = this.state;

      this.last.noteIdCounter = noteIdCounter;

      let fullWidth = window.innerWidth;

      const noteElements = [];

      for(const n of notes) {
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

      const timeBar = e(TimeBar, {
        noteview: this,
        h: 128 * scaleY,
        key: -3,
      });

      const selectBox = e('div', {
        className: 'selectBox',
        ref: selectDiv,
        hidden: true,
        key: -4,
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
      }, [
        pitchTopBar,
        pitchBotBar,
        timeBar,
        selectBox,
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
    visibleBrushes: state.visibleBrushes,
    visibleVoices: state.visibleVoices,
  });

  const mapDispatchToProps = dispatch => ({
    insertNote: (note) => dispatch({ type: 'INSERT_NOTE', note }),
    selectNotes: (ids) => dispatch({ type: 'SELECT_NOTES', ids }),
    shiftSelectNotes: (ids) => dispatch({ type: 'SHIFT_SELECT_NOTES', ids }),
    deselectAll: () => dispatch({ type: 'DESELECT_ALL_NOTES' }),
  });

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(NoteView);
})();