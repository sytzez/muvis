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
        nextProps.color !== props.color ||
        nextProps.selected !== props.selected
      );
    }

    move(time, pitch) {
      const { id, selected, selectedNotes, moveNote, moveNotes } = this.props;
      if (selected)
        moveNotes(selectedNotes, time - this.props.start, pitch - this.props.pitch);
      else
        moveNote(id, time, pitch);
    }

    resize(length) {
      const { id, selected, selectedNotes, resizeNote, resizeNotes } = this.props;
      if (selected)
        resizeNotes(selectedNotes, length - this.props.length);
      else
        resizeNote(id, length);
    }

    onMouseDown(e) {
      if (e.altKey) return;

      e.stopPropagation();

      const {
        id, editMode, brush, voice, resizable,
        paintNote, voiceNote, removeNote, selectNote,
      } = this.props;

      if (e.shiftKey) {
        if (e.button === 0)
          selectNote(id);
      } else {
        if (resizable) {
          if (e.button === 0 && !e.ctrlKey)
            this.startMoving(e);
        }
        if (editMode === editModes.NOTES) {
          if (e.button === 2 && e.ctrlKey)
            removeNote(id);
        } if (editMode === editModes.PAINT) {
          if (e.button === 0 && e.ctrlKey)
            paintNote(id, brush);
          else if (e.button === 2 && e.ctrlKey)
            paintNote(id, -1);
        } else if (editMode === editModes.VOICES) {
          if (e.button === 0 && e.ctrlKey)
            voiceNote(id, voice);
        }
      }
    }

    onMouseEnter(e) {
      if (e.altKey) return;

      // e.buttons polyfill (Safari)
      const buttons = e.buttons !== undefined ? e.buttons : e.nativeEvent.which;

      const {
        id, editMode, brush, voice,
        paintNote, voiceNote, removeNote,
      } = this.props;

      if (editMode === editModes.NOTES) {
        if (buttons === 2 && e.ctrlKey)
          removeNote(id);
      } else if (editMode === editModes.PAINT) {
        if (buttons === 1 && e.ctrlKey)
          paintNote(id, brush);
        else if (buttons === 2 && e.ctrlKey)
          paintNote(id, -1);
      } else if (editMode === editModes.VOICES) {
        if (buttons === 1 && e.ctrlKey)
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
      const { noteview } = this.props;

      const { time, pitch } = noteview.getTimeAndPitch(
        e.clientX - this.grabX,
        e.clientY,
      );

      if (now < this.last) {
        const { scaleX, scaleY, selected } = this.props;
        const div = this.ref.current;
        div.style.left = scaleX * time - (selected ? 2 : 1);
        div.style.top = scaleY * pitch - (selected ? 2 : 1);
      } else {
        this.last = now + 80;
        this.move(time, pitch);
      }
    }

    moveRelease(e) {
      const { noteview, scaleX, scaleY } = this.props;
      const { top, left } = this.ref.current.style;
      this.move(Math.round(parseInt(left) / scaleX), Math.round(parseInt(top) / scaleY))
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
      const { noteview, start } = this.props;

      const { time } = noteview.getTimeAndPitch(e.clientX, 0);

      if (now < this.last) {
        const { scaleX } = this.props;
        const div = this.ref.current;
        div.style.width = scaleX * (time - start);
      } else {
        this.last = now + 100;
        this.resize(Math.max(time - start, 1));
      }
    }

    resizeRelease(e) {
      const { noteview, scaleX } = this.props;
      const { width } = this.ref.current.style;
      this.resize(Math.max(Math.round(parseInt(width) / scaleX), 1));
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

      return e('div', {
          className: 'note ' + (selected ? 'selected ' : '') + color,
          ref: this.ref,
          onMouseDown: this.onMouseDown.bind(this),
          onMouseEnter: this.onMouseEnter.bind(this),
          onDragStart: (e) => e.preventDefault(),
          // onMouseUp: (e) => this.props.onMouseUp(id, e),
          onContextMenu: (e) => {
            e.preventDefault();
            // this.onMouseUp.bind(this)(e);
          },
          style: {
            left: scaleX * start - (selected ? 2 : 1),
            top: scaleY * pitch - (selected ? 2 : 1),
            width: scaleX * length,
            height: scaleY,
            cursor: resizable ? 'move' : 'auto',
          },
        }, resizable ? e('div', {
          className: 'note_right',
          onMouseDown: (e) => {
            e.stopPropagation();
            if (e.button === 0 && resizable)
              this.startResizing(e);
          },
        }) : null,
      );
    }
  }

  const mapStateToProps = (_, ownProps) => {
    const { id } = ownProps;
    
    let lastNote = {
      voice: null,
      brush: null,
    };

    let last = {
      notes: null,
      brushes: null,
      voices: null,
      visibleBrushes: null,
      visibleVoices: null,
    };

    let lastBrush = null;
    let lastBrushGhost = false;
    let lastVoiceGhost = false;
    let lastSelected = false;

    return state => {
      const note = (last.notes !== state.notes) ?
         getNoteById(state.notes, id) : lastNote;

      // determine visibility
      let ghost = false;

      const voiceGhost = (note.voice !== lastNote.voice ||
        state.visibleVoices !== last.visibleVoices) ?
        !state.visibleVoices.includes(note.voice) :
        lastVoiceGhost;
      lastVoiceGhost = voiceGhost;

      if (note.brush !== -1) {
        const brushGhost = (note.brush !== lastNote.brush ||
          state.visibleBrushes !== last.visibleBrushes) ?
          !state.visibleBrushes.includes(note.brush) :
          lastBrushGhost;
        lastBrushGhost = brushGhost;
        
        ghost = voiceGhost || brushGhost;
      } else {
        ghost = voiceGhost;
      }

      // determine color
      let color = '';

      if (!ghost) {
        if (state.colorMode === colorModes.VOICE) {
          color = state.voices[note.voice].noteColor;
        } else if (state.colorMode === colorModes.BRUSH) {
          if (note.brush !== -1) {
            const brush = (last.brushes !== state.brushes ||
              lastNote.brush !== note.brush) ?
              getBrushById(state.brushes, note.brush) :
              lastBrush;
            lastBrush = brush;

            color = brush.noteColor;
          }
        }
      }

      // determine selected
      const selected = (state.selectedNotes !== last.selectedNotes) ?
        state.selectedNotes.includes(id) : lastSelected;
      lastSelected = selected;
      
      // return props
      lastNote = note;
      last = state;

      return {
        selected,
        ghost,
        scaleX: state.scaleX,
        scaleY: state.scaleY,
        start: note.start,
        length: note.length,
        pitch: note.pitch,
        color,
        resizable: state.editMode === editModes.NOTES,
        editMode: state.editMode,
        brush: state.selectedBrush,
        voice: state.selectedVoice,
        selectedNotes: state.selectedNotes,
      };
    };
 };
//   const mapStateToProps = (state, ownProps) => { // TODO make func in func, remember things
//     const { id } = ownProps;

//     const note = getNoteById(state.notes, id);

//     const {
//       colorMode, editMode, brushes, voices, visibleBrushes, visibleVoices
//     } = state;
    
//     // determine visibility
//     let ghost = !visibleVoices.includes(note.voice);
//     if (note.brush !== -1)
//       ghost |= !visibleBrushes.includes(note.brush);

//     // determine color
//     let color = '';
//     if (!ghost) {
//       if (colorMode === colorModes.VOICE) {
//         color = voices[note.voice].noteColor;
//       } else if (colorMode === colorModes.BRUSH) {
//         if (note.brush !== -1)
//           color = getBrushById(brushes, note.brush).noteColor;
//       }
//     }

//     return {
//       selected: state.selectedNotes.includes(id),
//       ghost,
//       scaleX: state.scaleX,
//       scaleY: state.scaleY,
//       start: note.start,
//       length: note.length,
//       pitch: note.pitch,
//       color,
//       resizable: editMode === editModes.NOTES,
//       editMode: state.editMode,
//       brush: state.selectedBrush,
//       voice: state.selectedVoice,
//       selectedNotes: state.selectedNotes,
//     };
//  };

  const mapDispatchToProps = dispatch => ({
    selectNote: (id) =>
      dispatch({ type: 'SHIFT_SELECT_NOTE', id }),
    paintNote: (id, brushId) =>
      dispatch({ type: 'PAINT_NOTE', id, brushId }),
    voiceNote: (id, voiceId) =>
      dispatch({ type: 'VOICE_NOTE', id, voiceId }),
    moveNote: (id, start, pitch) =>
      dispatch({ type: 'UPDATE_NOTE', id, note: { pitch, start } }),
    moveNotes: (ids, time, pitch) =>
      dispatch({ type: 'MOVE_NOTES', ids, time, pitch }),
    resizeNote: (id, length) =>
      dispatch({ type: 'UPDATE_NOTE', id, note: { length } }),
    resizeNotes: (ids, length) =>
      dispatch({ type: 'RESIZE_NOTES', ids, length }),
    removeNote: (id) =>
      dispatch({ type: 'REMOVE_NOTE', id }),
  });

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(Note);
})();