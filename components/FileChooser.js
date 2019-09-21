const FileChooser = (() => {
  class FileChooser extends React.Component {
    componentDidMount() {
      MidiParser.parse(document.getElementById('midifile'), midiLoader);
    }

    render() {
      return React.createElement('input', {
        type: 'file',
        id: 'midifile',
      });
    }
  }

  return FileChooser;
})();