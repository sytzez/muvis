const NoteView = (() => {
  'use strict';

  const e = React.createElement;
  const br = key => e('br', {key});

  const HelpText = ReactRedux.connect(
    state => {
      const text = [];
      switch(state.editMode) {
        case editModes.NOTES:
          text.push(
            'Note edit mode:', br(0),
            'LMB: Move/resize note', br(1),
            'Ctrl+LMB: Insert note', br(2),
            'Ctrl+RMB: Remove note', br(3),
          ); break;
        case editModes.PAINT:
          text.push(
            'Brush paint mode:', br(0),
            'LMB: Paint note with brush', br(1),
            'RMB: Unpaint note', br(2),
          ); break;
        case editModes.VOICES:
          text.push(
            'Voice paint mode:', br(0),
            'LMB: Paint note with voice', br(1),
          ); break;
      }
      text.push(
        'Alt+LMB: Set play position', br(10),
        // 'Shift+Scroll: Vertical scroll', br(11),
        // 'Ctrl+Scroll: Vertical zoom', br(12),
        // 'Ctrl+Shift+Scroll: Horizontal zoom', br(13),
      );
      return { text };
    },
  )(({ text }) => e('div', { className: 'noteviewHelpText'}, text));

  class NoteView extends React.Component {
    internal = {
      outerDiv: React.createRef(),
      innerDiv: React.createRef(),
      selectDiv: React.createRef(),
      mouseMoveCallback: null,
      mouseUpCallback: null,
    }

    zoomFix = false;
    zoomX = 0;
    zoomY = 0;
    zoomReal = 0;
    zoomMidi = 0;

    selectBox = null;

    keyEvent = this.onKeyPress.bind(this);

    last = {
      noteIdCounter: 0,
    }

    state = {
      leftTimeBound: 0,
      rightTimeBound: 0,
    }

    componentDidMount() {
      const { scaleX, scaleY, scrollX, scrollY } = this.props;
      const div = this.internal.outerDiv.current;
      div.scrollLeft = scrollX * scaleX;
      div.scrollTop = scrollY * scaleY; 
      this.updateTimeBounds();
      window.addEventListener('keydown', this.keyEvent);
    }

    componentWillUnmount() {
      window.removeEventListener('keydown', this.keyEvent);
    }

    shouldComponentUpdate(nextProps, nextState) {
      if (
        this.state.leftTimeBound !== nextState.leftTimeBound ||
        this.state.rightTimeBound !== nextState.rightTimeBound ||
        this.props.scaleX !== nextProps.scaleX ||
        this.props.scaleY !== nextProps.scaleY ||
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

    selectAll() {
      const { notes, selectNotes, visibleBrushes, visibleVoices } = this.props;

      const selection = notes.filter(n =>
        (n.brush === -1 || visibleBrushes.includes(n.brush)) &&
        visibleVoices.includes(n.voice)
      ).map(n => n.id);

      selectNotes(selection);
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

    putTime(x) {
      const { tempo } = this.props;
      const { time } = this.getTimeAndPitch(x, 0);
      hotPlayback.setTime(getRealFromMidi(tempo, time));
    }

    onMouseDown(e) {
      click++;

      const { editMode, deselectAll } = this.props;

      if (e.ctrlKey) {
        if (editMode === editModes.NOTES) {
          if (e.button === 0)
            this.insertNoteAtPoint(e.clientX, e.clientY);
        }
      } else if (e.altKey) {
        if (e.button === 0)
          this.putTime(e.clientX);
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

      const buttons = e.buttons !== undefined ? e.buttons : e.nativeEvent.which;
      if (buttons === 1 && e.altKey)
        this.putTime(e.clientX);
    }

    lastScrollDispatch = 0;

    onScroll(e) {
      this.updateTimeBounds();

      const now = performance.now();
      if (true) {
        this.lastScrollDispatch = now;

        const { scaleX, scaleY, setScroll } = this.props;
        const div = this.internal.outerDiv.current;

        setScroll(div.scrollLeft / scaleX, div.scrollTop / scaleY);
      }
    }

    onWheel(e) {
      if (!e.ctrlKey) return;

      if (e.shiftKey) {
        const { scaleY, setScaleY } = this.props;
        setScaleY(scaleY + (e.deltaY < 0 ? 1 : -1));
      } else {
        const { scaleX, setScaleX } = this.props;
        setScaleX(scaleX * Math.SQRT2 * (e.deltaY < 0 ? 1.0 : 0.5))
      }

      const { time, pitch } = this.getTimeAndPitch(e.clientX, e.clientY);
      this.zoomFix = true;
      this.zoomX = e.clientX;
      this.zoomY = e.clientY;
      this.zoomTime = time;
      this.zoomPitch = pitch;

      this.updateTimeBounds();
    }

    onKeyPress(e) {
      const { selectedNotes } = this.props;
      if (e.keyCode === 65 && e.ctrlKey) { // Ctrl+A
        e.preventDefault();
        this.selectAll();
      } else if (e.keyCode === 46) { // Delete
        e.preventDefault();
        this.deleteSelection();
      } else if (e.keyCode === 88 && e.ctrlKey) { // Ctrl+X
        e.preventDefault();
        clipboard.cut(selectedNotes);
      } else if (e.keyCode === 67 && e.ctrlKey) { // Ctrl+C
        e.preventDefault();
        clipboard.copy(selectedNotes);
      } else if (e.keyCode === 86 && e.ctrlKey) { // Ctrl+V
        e.preventDefault();
        this.paste();
      }
    }

    paste() {
      const { top, left, width, height } =
        this.internal.outerDiv.current.getBoundingClientRect();
      const { pitch, time } = this.getTimeAndPitch(
        left + width * 0.5,
        top + height * 0.5
      );
      clipboard.paste(time, pitch);
    }

    deleteSelection() {
      const { removeNotes, selectedNotes } = this.props;
      removeNotes(selectedNotes);
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

      if (outerDiv.current) {
        if (this.zoomFix) {
          const { zoomX, zoomY, zoomTime, zoomPitch } = this;
          const { top, left } = outerDiv.current.getBoundingClientRect();
          outerDiv.current.scrollLeft = (zoomTime * scaleX) - zoomX + left;
          outerDiv.current.scrollTop = (zoomPitch * scaleY) - zoomY + top;
          this.zoomFix = false;
        } else {
          const { scaleX, scaleY, scrollX, scrollY } = this.props;
          outerDiv.current.scrollLeft = scaleX * scrollX;
          outerDiv.current.scrollLeft = scaleY * scrollY;
        }
      }

      return [e('div', {
        style: {position: 'relative'},
        key: 0,
      }, e(HelpText, {key: 1})),
      e('div', {
        className: 'noteview',
        id: 'noteview',
        ref: outerDiv,
        onScroll: this.onScroll.bind(this),
        key: 1,
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
      ]))];
    }
  }

  const mapStateToProps = state => ({
    notes: state.notes,
    editMode: state.editMode,
    brush: state.selectedBrush,
    voice: state.selectedVoice,
    scaleX: state.scaleX,
    scaleY: state.scaleY,
    scrollX: state.scrollX,
    scrollY: state.scrollY,
    pitchTop: state.pitchTop,
    pitchBot: state.pitchBot,
    visibleBrushes: state.visibleBrushes,
    visibleVoices: state.visibleVoices,
    tempo: state.tempo,
    selectedNotes: state.selectedNotes,
  });

  const mapDispatchToProps = dispatch => ({
    insertNote: note => dispatch({ type: 'INSERT_NOTE', note }),
    selectNotes: ids => dispatch({ type: 'SELECT_NOTES', ids }),
    shiftSelectNotes: ids => dispatch({ type: 'SHIFT_SELECT_NOTES', ids }),
    deselectAll: () => dispatch({ type: 'DESELECT_ALL_NOTES' }),
    removeNotes: ids => dispatch({ type: 'REMOVE_NOTES', ids }),
    setScaleX: scaleX => dispatch({ type: 'SET_SCALE_X', scaleX }),
    setScaleY: scaleY => dispatch({ type: 'SET_SCALE_Y', scaleY }),
    setScroll: (scrollX, scrollY) =>
      dispatch({ type: 'SET_SCROLL', scrollX, scrollY }),
  });

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(NoteView);
})();