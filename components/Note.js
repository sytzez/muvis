const Note = (() => {
  'use strict';

  const e = React.createElement;

  class Note extends React.Component {
    grabX = 0;
    grabY = 0;
    ref = React.createRef();
    last = 0;

    shouldComponentUpdate(nextProps, nextState) {
      const props = this.props;
      return (
        nextProps.ghost !== props.ghost ||
        nextProps.scaleX !== props.scaleX ||
        nextProps.scaleY !== props.scaleY ||
        nextProps.start !== props.start ||
        nextProps.length !== props.length ||
        nextProps.pitch !== props.pitch ||
        // nextProps.x !== props.x ||
        // nextProps.y !== props.y ||
        // nextProps.w !== props.w ||
        // nextProps.h !== props.h ||
        nextProps.color !== props.color ||
        nextProps.selected !== props.selected
      );
    }

    onMouseDown(e) {
      e.stopPropagation();

      const {
        id, editMode, brush, voice,
        paintNote, voiceNote, removeNote, selectNote,
      } = this.props;

      if (e.shiftKey) {
        if (e.button === 0)
          selectNote(id);
      } else {
        if (editMode === editModes.NOTES) {
          if (e.button === 0)
            this.startMoving(e);
          else if (e.button === 2)
            removeNote(id);
        } else if (editMode === editModes.PAINT) {
          if (e.button === 0)
            paintNote(id, brush);
          else if (e.button === 2)
            paintNote(id, -1);
        } else if (editMode === editModes.VOICES) {
          if (e.button === 0)
            voiceNote(id, voice);
        }
      }
    }

    onMouseEnter(e) {
      // e.buttons polyfill (Safari)
      const buttons = e.buttons !== undefined ? e.buttons : e.nativeEvent.which;

      const {
        id, editMode, brush, voice,
        paintNote, voiceNote, removeNote,
      } = this.props;

      if (editMode === editModes.NOTES) {
        if (buttons === 2)
          removeNote(id);
      } else if (editMode === editModes.PAINT) {
        if (buttons === 1)
          paintNote(id, brush);
      } else if (editMode === editModes.VOICES) {
        if (buttons === 1)
          voiceNote(id, voice);
      }
    }

    startMoving(e) {
      const { left } = this.ref.current.getBoundingClientRect();
      this.grabX = e.clientX - left;

      const { noteview } = this.props;
      noteview.setMouseCallback(
        this.moveCallback.bind(this),
        this.moveRelease.bind(this),
      );
    }

    moveCallback(e) {
      const now = performance.now();
      const { id, noteview, moveNote } = this.props;

      const { time, pitch } = noteview.getTimeAndPitch(
        e.clientX - this.grabX,
        e.clientY,
      );

      if (now < this.last) {
        const { scaleX, scaleY } = this.props;
        const div = this.ref.current;
        div.style.left = scaleX * time;
        div.style.top = scaleY * pitch;
      } else {
        this.last = now + 100;
        moveNote(id, time, pitch);
      }
    }

    moveRelease(e) {
      const { id, noteview, moveNote, scaleX, scaleY } = this.props;
      const { top, left } = this.ref.current.style;
      moveNote(id, Math.round(parseInt(left) / scaleX), Math.round(parseInt(top) / scaleY))
      noteview.removeMouseCallback();
    }

    startResizing(e) {
      const { noteview } = this.props;
      this.grabX = this.ref.current.getBoundingClientRect().left -
        noteview.internal.innerDiv.current.getBoundingClientRect().left;

      noteview.setMouseCallback(
        this.resizeCallback.bind(this),
        this.resizeRelease.bind(this),
      );
    }

    resizeCallback(e) {
      const now = performance.now();
      const { id, noteview, resizeNote, start } = this.props;

      const { time } = noteview.getTimeAndPitch(e.clientX, 0);

      if (now < this.last) {
        const { scaleX } = this.props;
        const div = this.ref.current;
        div.style.width = scaleX * (time - start);
      } else {
        this.last = now + 100;
        resizeNote(id, Math.max(time - start, 1));
      }
    }

    resizeRelease(e) {
      const { id, noteview, resizeNote, scaleX } = this.props;
      const { width } = this.ref.current.style;
      resizeNote(id, Math.max(Math.round(parseInt(width) / scaleX), 1));
      noteview.removeMouseCallback();
    }

    render() {
      const {
        selected, resizable, ghost,
        scaleX, scaleY,
        start, length, pitch, color,
      } = this.props;

      if (ghost) {
        return e('div', {
          className: 'ghost ' + (selected ? 'selected ' : ''),
          style: {
            left: scaleX * start,
            top: scaleY * pitch,
            width: scaleX * length,
            height: scaleY,
          },
        },);
      }

      return e(
        'div',
        {
          className: 'note ' + (selected ? 'selected ' : '') + color,
          ref: this.ref,
          onMouseDown: this.onMouseDown.bind(this),
          onMouseEnter: this.onMouseEnter.bind(this),
          onDragStart: () => false,
          // onMouseUp: (e) => this.props.onMouseUp(id, e),
          onContextMenu: (e) => {
            e.preventDefault();
            // this.onMouseUp.bind(this)(e);
          },
          style: {
            left: scaleX * start,
            top: scaleY * pitch,
            width: scaleX * length,
            height: scaleY,
            cursor: resizable ? 'move' : 'auto',
          },
        },
        resizable ? e('div', {
          className: 'note_right',
          onMouseDown: (e) => {
            e.stopPropagation();
            if (e.button === 0)
              this.startResizing(e);
          },
        }) : null,
      );
    }
  }

  const mapStateToProps = (state, ownProps) => {
    const { id } = ownProps;

    const note = getNoteById(state.notes, id);

    const {
      colorMode, editMode, brushes, voices, visibleBrushes, visibleVoices
    } = state;
    
    // determine color
    let color = '';
    if (colorMode === colorModes.VOICE) {
      color = voices[note.voice].noteColor;
    } else if (colorMode === colorModes.BRUSH) {
      if (note.brush !== -1)
        color = getBrushById(brushes, note.brush).noteColor;
    }

    // determine visibility
    let ghost = !visibleVoices.includes(note.voice);
    if (note.brush !== -1)
      ghost |= !visibleBrushes.includes(note.brush);
 
    return {
      selected: state.selectedNotes.includes(id),
      ghost,
      scaleX: state.scaleX,
      scaleY: state.scaleY,
      start: note.start,
      length: note.length,
      pitch: note.pitch,
      // x: note.start * state.scaleX,
      // y: note.pitch * state.scaleY,
      // w: note.length * state.scaleX,
      // h: state.scaleY,
      color,
      resizable: editMode === editModes.NOTES,
      editMode: state.editMode,
      brush: state.selectedBrush,
      voice: state.selectedVoice,
    };
 };

  const mapDispatchToProps = dispatch => ({
    selectNote: (id) =>
      dispatch({ type: 'SELECT_NOTE', id }),
    paintNote: (id, brushId) =>
      dispatch({ type: 'PAINT_NOTE', id, brushId }),
    voiceNote: (id, voiceId) =>
      dispatch({ type: 'VOICE_NOTE', id, voiceId }),
    moveNote: (id, start, pitch) =>
      dispatch({ type: 'UPDATE_NOTE', id, note: { pitch, start } }),
    resizeNote: (id, length) =>
      dispatch({ type: 'UPDATE_NOTE', id, note: { length } }),
    removeNote: (id) =>
      dispatch({ type: 'REMOVE_NOTE', id }),
  });

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(Note);
})();