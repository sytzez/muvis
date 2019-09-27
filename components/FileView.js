const FileView = (() => {
  'use strict';

  const e = React.createElement;

  class FileView extends React.Component {
    state = {
      jsonInput: '',
      jsonError: '',
      jsonUrl: '',
    };

    midiFile = React.createRef();
    jsonFile = React.createRef();

    downloadJSON() {
      const json = jsonSaver(store.getState());
      const file = new File([json], 'project.json', {
        type: 'application/json',
      }); // TODO file name
      const url = window.URL.createObjectURL(file);
      this.setState({ jsonUrl: url });
    }

    removeLink() {
      window.URL.revokeObjectURL(this.state.jsonUrl);
      this.setState({ jsonUrl: '' });
    }

    componentDidMount() {
      MidiParser.parse(this.midiFile.current, midiLoader);
    }

    render() {
      const { jsonInput, jsonError, jsonUrl } = this.state;
      const { loadEmpty } = this.props;
      const { midiFile, jsonFile } = this;

      return e('div', { className: 'fileView' }, [
        'Start empty project: ',
        e('button', {
          onClick: loadEmpty,
          key: -10,
        }, 'New project'),
        e('hr', {key: -11}),

        'Import MIDI file: ',
        e('input', {
          type: 'file',
          accept: 'audio/midi,.mid,.midi',
          ref: midiFile,
          key: 0,
        }),
        e('hr', {key: 1}),

        'Load project from JSON file: ',
        e('input', {
          type: 'file',
          accept: 'application/json,.json,.txt',
          ref: jsonFile,
          key: 2
        }),
        e('hr', {key: 3}),

        'Load project from plain JSON text: ',
        e('input', {
          placeholder: 'Paste here...',
          value: jsonInput,
          onChange: ((e) => this.setState({ jsonInput: e.target.value })).bind(this),
          key: 4,
        }),
        e('button', {
          onClick: (() => {
            try {
              jsonLoader(this.state.jsonInput);
              this.setState({ jsonError: '' });
            } catch(e) {
              this.setState({ jsonError: e.toString() });
            }
          }).bind(this),
          key: 5,
        }, 'Load'),
        jsonError !== '' ? e('div', {key: 5.5}, jsonError) : null,
        e('hr', {key: 6}),

        'Download project as JSON file: ',
        e('button', {
          onClick: this.downloadJSON.bind(this),
          key: 10,
        }, 'Create file'),
        jsonUrl !== '' ? e('a', {
          href: jsonUrl,
          download: true,
          key: 11,
        }, 'Download link') : null,
        e('hr', {key: 12}),

        'Load example project: ',
        e('br', {key: 20}),
      ]);
    }
  }

  const mapStateToProps = state => ({

  });

  const mapDispatchToProps = dispatch => ({
    loadEmpty: () => dispatch({ type: 'LOAD_EMPTY' }),
  })

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(FileView);
})();