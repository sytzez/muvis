'use strict';
const StringInput = class extends React.Component {
  state = {
    lastPropValue: '',
    changed: false,
    value: '',
  }

  static getDerivedStateFromProps(props, state) {
    if (props.value !== state.lastPropValue) {
      return {
        lastPropValue: props.value,
        changed: false,
      };
    }
    return null;
  }

  render() {
    const { change, size = 12 }  = this.props;
    return React.createElement('input', {
      size,
      value: this.state.changed ?
        this.state.value : this.props.value,
      onChange: (e => {
        this.setState({ value: e.target.value, changed: true });
      }).bind(this),
      onBlur: e => {
        click++;
        change(e.target.value);
      },
      onKeyDown: e => {
        if (e.keyCode === 13) {
          e.preventDefault();
          click++;
          change(e.target.value);
        }
      },
    });
  }
};