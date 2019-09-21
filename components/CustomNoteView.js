CustomNoteView = (() => {
  'use strict';

  const e = React.createElement();

  class NoteView extends React.Component {
    internal = {
      unsub: null,
      noteIds: new Set(),
      noteElements: [],
      ref: React.createRef(),
    }
    
    componentWillMount() {
      this.internal.unsub = this.props.store.subscribe(this.subscription.bind(this));
      this.subscription();
    }

    componentWillUnmount() {
      this.props.store.unsubscribe(this.internal.unsub);
    }

    subscription() {
      const state = this.props.store.getState();

      const div = this.internal.ref.current;

      const notes = state.notes;
      const noteIds = this.internal.noteIds;
      const noteElements = this.internal.noteElements;
      const currentIds = new Set();

      // check for new notes to be added to the view
      for(let i = 0; i < notes.length; i++) {
        const note = notes[i];
        currentIds.add(note.id);
        if (!noteIds.has(note.id)) {
          noteIds.add(note.id);
          const element = noteToElement(note);
          noteElements.push(element);
          div.appendChild(elements)
        }
      }

      // check for notes in the view to be removed
      let elementsNeedRemoval = false;
      for(let i = 0; i < noteElements.length; i++) {
        const noteEl = noteElement[i];
        if (!currentIds.has(noteEl.id)) {
          div.removeChild(noteEl);
          elementsNeedRemoval = true;
        }
      }
      if (elementsNeedRemoval)
        this.internal.noteElements = noteElements.filter(ne => currentIds.has(ne.id));


    }

    noteToElement(note) {

    }
    
    render() {
      return e('div', {className: 'noteview', id: 'noteview'}, e('div', {
        className: 'noteview_inside',
        style: { height: 128 * 20 },
        id: 'noteview_inside',
        ref: this.internal.ref,
      }));
    }
  }

  return NoteView;
})();