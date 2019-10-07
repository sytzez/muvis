const clipboard = (() => {
  let clipboard = [];

  const cut = ids => {
    copy(ids);
    store.dispatch({ type: 'REMOVE_NOTES', ids });
  };

  const copy = ids => {
    if (ids.length === 0) return;
    const notes = getNotesByIds(store.getState().notes, ids);
    let pitch = Infinity, time = Infinity;
    notes.forEach(n => {
      if (n.start < time)
        time = n.start;
    });
    console.log(pitch, time);
    clipboard = notes.map(n => ({
      ...n,
      start: n.start - time,
    }));
    console.log(clipboard);
  };

  const paste = (time, pitch) => {
    store.dispatch({
      type: 'INSERT_NOTES',
      notes: clipboard.map(
        n => ({
          ...n,
          pitch: n.pitch,
          start: n.start + time,
        })
      ),
    });
  }

  return {
    cut,
    copy,
    paste,
  };
})();