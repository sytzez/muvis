'use strict';
const ValueInput = class extends React.Component {
  state = {
    changed: false,
    value: 0,
  }

  set(val) {
    const { min, max } = this.props;
    const floatVal = Math.min(Math.max(parseFloat(val), min), max);
    this.setState({
      changed: true,
      value: floatVal,
    });
    this.props.change(floatVal);
  }

  render() {
    const e = React.createElement;
    const { changed } = this.state;
    const { text, min, max }  = this.props;

    const textInput = e(StringInput, {
      size: 3,
      value: parseFloat(
        changed ? this.state.value : this.props.value,
      ).toFixed(2),
      change: this.set.bind(this),
      key: 0,
    });

    const slideInput = e('input', {
      type: 'range',
      min: 0, max: 512,
      value:
        ((this.state.changed ? this.state.value: this.props.value) - min)
        * 512.0 / (max - min),
      onChange: (e => {
        this.setState({
          value: (e.target.value / 512.0) * (max - min) + min,
          changed: true,
        });
      }).bind(this),
      onBlur: (e => {
        this.set(this.state.value);
      }).bind(this),
      onMouseDown: (e => {
        click++;
      }),
      onMouseUp: (e => {
        this.set(this.state.value);
      }).bind(this),
      key: 1,
    });

    return [ text, e('div', {key: 0}, [ textInput, slideInput ]) ];
  }
};