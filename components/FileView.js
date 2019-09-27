const FileView = (() => {
  'use strict';

  const e = React.createElement;

  class FileView extends React.Component {
    state = {
      jsonInput: '',
      jsonError: '',
    };

    render() {
      const { jsonInput, jsonError } = this.state;

      return e('div', {}, [
        'Import MIDI file: ',
        e(FileChooser, {key: 0}),
        e('hr', {key: 1}),

        'Load project from JSON file: ',
        e('div', {key: 2}),
        e('hr', {key: 3}),

        'Load project from plain JSON text:',
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
        jsonError !== '' ? `Error: ${jsonError}` : null,
        e('hr', {key: 6}),

        e('button', {
          key: 10,
        }, 'Download project as JSON file'),

        'Example projects: ',
        e('br', {key: 20}),
      ]);
    }
  }

  return ReactRedux.connect()(FileView);
})();