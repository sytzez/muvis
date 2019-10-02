const TimeInput = (() => {
  'use strict';

  const inv60 = 1.0 / 60.0;

  const padZero = (value, length) =>
    length > value.length ?
      '0'.repeat(length - value.length) + value :
      value;

  const formatTime = value => {
    const minutes = padZero(Math.floor(value * inv60).toString(), 2);
    const seconds = padZero((value % 60).toFixed(2), 5);
    return `${minutes}:${seconds}`;
  };

  const getSeconds = value => {
    const colonIndex = value.indexOf(':');
    if (colonIndex === -1)
      return parseFloat(value);
    const minutes = parseInt(value);
    const seconds = parseFloat(value.slice(colonIndex + 1));
    return minutes * 60 + seconds;
  };

  class TimeInput extends React.Component {
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
  
    apply(value) {
      click++;
      this.props.change(getSeconds(value));
    }
  
    render() {
      const { change } = this.props;
      return React.createElement('input', {
        size: 6,
        value: this.state.changed ?
          this.state.value : formatTime(this.props.value),
        onChange: (e => {
          this.setState({ value: e.target.value, changed: true });
        }).bind(this),
        onBlur: e => this.apply(e.target.value),
        onKeyDown: e => {
          if (e.keyCode === 13) {
            e.preventDefault();
            change(e.target.value);
          }
        },
      });
    }
  }

  return TimeInput;
})();