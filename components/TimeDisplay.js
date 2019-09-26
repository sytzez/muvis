const TimeDisplay = (() => {
  class TimeDisplay extends React.Component {
    state = {
      time: 0.0,
      listener: this.setTime.bind(this),
    }

    componentDidMount() {
      hotPlayback.addListener(this.state.listener);
    }

    componentWillUnmount() {
      hotPlayback.removeListener(this.state.listener);
    }

    setTime(t) {
      this.setState({ time: t });
    }

    render() {
      return React.createElement('input', {
        size: 2,
        value: this.state.time.toFixed(2),
        onChange: (e) => this.props.setTime(parseFloat(e.target.value)),
      });
    }
  }

  const mapDispatchToProps = dispatch => ({
    setTime: (time) => dispatch({ type: 'SET_TIME', time, hot: true }),
  });

  return ReactRedux.connect(
    null,
    mapDispatchToProps,
  )(TimeDisplay);
})();