const ErrorView = (() => {
  'use strict';
  const e = React.createElement;
  const br = (key) => e('br', { key });
  return class extends React.Component {
    state = {
      url: '',
    };

    getLink() {
      const json = jsonSaver(store.getState());
      const file = new File([json], 'project.json', {
        type: 'application/json',
      });
      const url = window.URL.createObjectURL(file);
      this.setState({ url });
    }

    componentWillUnmount() {
      const { url } = this.state;
      if (url !== '') window.URL.revokeObjectURL(url);
    }

    render() {
      const { fix } = this.props;
      const { url } = this.state;
      return e('div', { className: 'bigError' }, [
        'An unexpected error has crashed the app!', br(0),
        'You can try to revert to the previous state by clicking ',
        e('button',{
          onClick: () => {
            store.dispatch({ type: 'UNDO' });
            fix();
          },
          key: 1,
        }, 'Undo'), br(2),
        'Or you can download the project as a JSON file to load again later: ',
        e('button',{
          onClick: this.getLink.bind(this),
          key: 3,
        }, 'Get link'),
        url !== '' ? e('a', {
          href: url,
          download: true,
          key: 4,
        }, 'Download link') : null,
      ]);
    }
  };
})();