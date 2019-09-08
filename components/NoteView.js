const NoteView = (() => {
  'use strict';

  const e = React.createElement;

  class NoteView extends React.Component {
    internal = {
      dragging: false,
      dragButton: 0,
      dragNote: -1, dragSide: 0,
      dragX: 0, dragY: 0,
      dragModifier: 0,
      ref: null, // reference div
    }

    componentDidMount() {
      this.internal.ref = document.getElementById('noteview');
    }

    getTimePitch(x, y) {
      const { scaleX, scaleY } = this.props;
      const { ref } = this.internal;
      const { scrollLeft, scrollTop } = ref;
      const { left, top } = ref.getBoundingClientRect();
      return {
        time: Math.floor((x - left + scrollLeft) / scaleX),
        pitch: Math.floor((y - top + scrollTop) / scaleY),
      }
    }

    onPress(e, id = -1, side = 0) {
      this.internal.dragging = true;
      this.internal.dragX = e.clientX;
      this.internal.dragY = e.clientY;
      this.internal.dragButton = e.button;
      this.internal.dragNote = id;
      this.internal.dragSide = side;

      if (id === -1) this.onPressEmpty(e);
    }

    onPressEmpty(e) {
      const { editMode, brush, voice,
        insertNote, deselectAllNotes } = this.props;

      if (editMode === editModes.NOTES && e.button === 0 && e.ctrlKey) {
        const { time, pitch } = this.getTimePitch(e.clientX, e.clientY);
        insertNote({
          start: time,
          pitch: pitch,
          length: 10,
          voice: voice,
          brush: brush,
        });
      } else if (editMode === editModes.NOTES && e.button === 0 && !e.shiftKey) {
        deselectAllNotes();
      }
    }

    onRelease(e) {
      if (!this.internal.dragging) return;
      this.internal.dragging = false;
    }

    onEnterNote(id, e) {
      if (!this.internal.dragging) return;
      
      // e.buttons polyfill (Safari)
      const ebuttons = e.buttons !== undefined ? e.buttons : e.nativeEvent.which;
      
      if (ebuttons === 0) { // release if no button pressed anymore
        this.onRelease(e);
        return;
      };

      const { editMode, removeNote, shiftSelectNote, shiftDeselectNote,
        paintNote, brush, voiceNote, voice } = this.props;
      
      if (editMode === editModes.NOTES) {
        if (ebuttons === 1 && e.shiftKey) { // shift+LMB
          shiftSelectNote(id);
        } else if (ebuttons === 2 && e.shiftKey) { // shift+RMB
          shiftDeselectNote(id);
        } else if (ebuttons === 2) { // RMB
          removeNote(id);
        }
      } else if (editMode === editModes.PAINT) {
        if (ebuttons === 1) { // LMB
          paintNote(id, brush);
        } else if (ebuttons === 2) { // RMB
          paintNote(id, -1);
        }
      } else if (editMode === editModes.VOICES) {
        voiceNote(id, voice)
      }
    }

    onPressNote(id, e, side) {
      this.onPress(e, id, side);
      this.onEnterNote(id, e);
      
      const { editMode, selectNote, shiftSelectNote, removeNote, paintNote, brush } = this.props;
      if (editMode === editModes.NOTES) {
        if (e.button === 0) { // LMB
          if (e.shiftKey) shiftSelectNote(id);
          else selectNote(id);
        }
      } else if (editMode === editModes.PAINT) {
        paintNote(id, brush);
      }

      e.stopPropagation();
      e.preventDefault();
    }

    onReleaseNote(id, e) {
      this.onRelease(e);
      e.stopPropagation();
      e.preventDefault();
    }

    onMouseMove(e) {
      if (!this.internal.dragging) return;

      // e.buttons polyfill (Safari)
      const ebuttons = e.buttons !== undefined ? e.buttons : e.nativeEvent.which;
      
      if (ebuttons === 0) { // release if no button pressed anymore
        this.onRelease(e);
        return;
      };

      if (this.internal.dragNote === -1) return;

      const { notes, editMode, updateNote } = this.props;

      if (editMode === editModes.NOTES) {
        const { dragNote, dragSide } = this.internal;
        const note = getNoteById(notes, dragNote);
        const { time, pitch } = this.getTimePitch(e.clientX, e.clientY);

        if (dragSide === 0 && pitch !== note.pitch) {
          updateNote(dragNote, { pitch });
        } else if (dragSide === -1 && time !== note.start) {
          updateNote(dragNote, { start: time });
        } else if (dragSide === 1 && (time - note.start) !== note.length) {
          updateNote(dragNote, { length: time - note.start });
        }
      }
    }

    onClick(e) {
      const { editMode, brush, voice, scaleX, scaleY, insertNote } = this.props;
      const { ref } = this.internal;

      if (editMode === editModes.NOTES) {
        const { left: rectLeft, top: rectTop } = ref.getBoundingClientRect();
        const { scrollLeft, scrollTop } = ref;
        insertNote({
          start: Math.floor((e.clientX - rectLeft + scrollLeft) / scaleX),
          pitch: Math.floor((e.clientY - rectTop + scrollTop) / scaleY),
          length: 10,
          voice: voice,
          brush: brush,
        });
      }
    }

    render() {
      const { notes, ghosts, brushes, voices,
          scaleX, scaleY,
          selected, editMode, colorMode } = this.props;

      const resizableNotes = editMode === editModes.NOTES;

      let colorFunc = (n) => n.brush !== -1 ? 'color1' : '';
      const colorMap = new Map();

      if (colorMode === colorModes.BRUSH) {
        brushes.forEach(b => colorMap.set(b.id, b.noteColor));
        colorMap.set(-1, '');
        colorFunc = (n) => colorMap.get(n.brush);
      } else if (colorMode === colorModes.VOICE) {
        colorFunc = (n) => voices[n.voice].noteColor;
      }

      const noteEls = notes.map(n => e(Note, {
        id: n.id,
        x: n.start * scaleX,
        y: n.pitch * scaleY,
        w: n.length * scaleX,
        h: scaleY,
        color: colorFunc(n),
        selected: selected.includes(n.id),
        resizable: resizableNotes,
        onMouseEnter: ((id, e) => this.onEnterNote(id, e)),
        onMouseDown: ((id, e, side = 0) => this.onPressNote(id, e, side)),
        onMouseUp: ((id, e) => this.onReleaseNote(id, e)),
        key: n.id,
      }));

      const  ghostEls = ghosts.map(n => e(GhostNote, {
        x: n.start * scaleX,
        y: n.pitch * scaleY,
        w: n.length * scaleX,
        h: scaleY,
        selected: selected.includes(n.id),
        key: n.id,
      }));

      return e('div', {
        id: 'noteview',
        className: 'noteview',
        //onClick: (e) => this.onClick(e),
        onMouseDown: (e) => this.onPress(e),
        onMouseUp: (e) => this.onRelease(e),
        onContextMenu: (e) => e.preventDefault(),
        onMouseMove: (e) => this.onMouseMove(e),
      }, ghostEls.concat(noteEls));
    }
  }

  return NoteView;
})();