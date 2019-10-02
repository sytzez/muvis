const TimeDisplay = (() => {
  class TimeDisplay extends React.Component {
    state = {
      time: hotPlayback.getTime(),
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
      return React.createElement(TimeInput, {
        value: this.state.time,
        change: time => hotPlayback.setTime(time),
      });
    }
  }

  return TimeDisplay;
})();