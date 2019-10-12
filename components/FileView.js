const FileView = (() => {
  'use strict';

  const e = React.createElement;

  class ProjectLink extends React.Component {
    openJSON() {
      const { url, setParentLoading, setParentError } = this.props;
      setParentLoading(true);
      loadJsonFromUrl(url, setParentError);
    }

    render() {
      const { text } = this.props;

      return [
        '- ',
        e('a', {
          href: '#',
          onClick: this.openJSON.bind(this),
          key: 0,
        }, text),
        e('br', {key: 2}),
      ];
    }
  }

  class FileView extends React.Component {
    state = {
      midiError: '',
      jsonInput: '',
      jsonError: '',
      jsonUrl: '',
      jsonError2: '',
      projectError: '',
      isLoading: false,
    };

    midiFile = React.createRef();
    jsonFile = React.createRef();

    setLoading(isLoading) {
      this.setState({ isLoading });
    }

    downloadJSON() {
      if (this.state.jsonUrl !== '')
        this.removeDownloadLink();

      const json = jsonSaver(store.getState());
      const file = new File([json], 'project.json', {
        type: 'application/json',
      }); // TODO file name
      const url = window.URL.createObjectURL(file);
      this.setState({ jsonUrl: url });
    }

    removeDownloadLink() {
      window.URL.revokeObjectURL(this.state.jsonUrl);
      this.setState({ jsonUrl: '' });
    }

    midiParserCallback(file) {
      if (file === false) {
        this.setState({ midiError: 'Invalid file' });
      } else {
        midiLoader(file);
      }
    }

    setProjectError(e) {
      this.setState({ projectError: e.toString(), isLoading: false });
    }

    componentDidMount() {
      MidiParser.parse(this.midiFile.current, this.midiParserCallback.bind(this));
    }

    componentWillUnmount() {
      if (this.state.jsonUrl !== '')
        this.removeDownloadLink();
    }

    render() {
      const { midiError, jsonInput, jsonError,
        jsonUrl, jsonError2, projectError, isLoading } = this.state;
      const { loadEmpty } = this.props;
      const { midiFile, jsonFile } = this;

      if (isLoading) {
        return e('div',{className: 'loader', key: -100});
      }

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
        midiError !== '' ? e('div', {key: 0.5}, midiError) : null,
        e('hr', {key: 1}),

        'Load project from JSON file: ',
        e('input', {
          type: 'file',
          accept: 'application/json,.json,.txt',
          onChange: ((e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            const fv = this;
            this.setState({ jsonError2: '' });
            reader.onload = (e) => {
              try {
                const json = e.target.result;
                jsonLoader(json);
              } catch(e) {
                fv.setState({ jsonError2: 'Invalid JSON' });
                console.log(e);
              }
            }
            reader.readAsText(file);
          }).bind(this),
          ref: jsonFile,
          key: 2
        }),
        jsonError2 !== '' ? e('div', {key: 2.5}, jsonError2) : null,
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
              this.setState({ jsonError: 'Invalid file' });
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

        e(ProjectLink, {
          text: 'Wagner - Tristan und Isolde - Prelude',
          url: 'states/tristan.json',
          setParentLoading: this.setLoading.bind(this),
          setParentError: this.setProjectError.bind(this),
          key: 21,
        }),
        // '- ',
        // e('a', {
        //   href: '#',
        //   onClick: () => this.openJSON.bind(this)('states/tristan.json'),
        //   key: 21,
        // }, 'Wagner - Tristan und Isolde - Prelude'),
        // e('br', {key: 22}),
        // '- ',
        // e('a', {
        //   href: '#',
        //   onClick: () => this.openJSON.bind(this)('states/rameau.json'),
        //   key: 23,
        // }, 'Rameau - Gavotte et six doubles'),
        // e('br', {key: 24}),
        // '- ',
        // e('a', {
        //   href: '#',
        //   onClick: () => this.openJSON.bind(this)('states/kyrie.json'),
        //   key: 25,
        // }, 'de Machaut - Missa de Notre Dame - Kyrie'),
        // e('br', {key: 26}),

        projectError !== '' ? e('div', {
          className: 'error',
          key: 30,
        }, projectError) : null,
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