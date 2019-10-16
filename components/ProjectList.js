const ProjectList = (() => {
  'use strict';
  const e = React.createElement;

  const Item = (id, title) => e(
    'div', {},
    [' -', e('a', {
      href: '#',
      onClick: () => {
        REST.getProjectContent(id, (err, data) => {
          if (err) {
            console.log(err);
          } else {
            jsonLoader(data, editorModes.VISUAL);
          }
        });
      },
    }, title) ]
  );

  const ProjectList = class extends React.Component {
    state = {
      data: [],
      error: '',
    };

    receiveProjects(err, data) {
      if (err) {
        console.log(err);
      } else {
        this.setState({
          data: data.data,
          error: '',
        });
      }
    }

    componentDidMount() {
      REST.getProjects(this.receiveProjects.bind(this));
    }

    componentDidCatch(error, info) {
      console.log(error, info);
      this.setState({ error: 'Something went wrong displaying user projects' });
    }
    
    render() {
      const { data, error } = this.state;

      if (error !== '') {
        return e('div', {
          className: 'error'
        }, error);
      }

      const items = data.map(props =>
        e(Item, {
          id: props.id,
          title: props.title,
          key: props.id,
        }));
      
      return [
        'User projects:',
        e('br', {key: -1}),
        ...items,
      ];
    }
  };

  return ProjectList;
})();