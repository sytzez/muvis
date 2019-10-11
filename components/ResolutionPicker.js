const ResolutionPicker = (() => {
  'use strict';
  const e = React.createElement;

  class ResolutionPicker extends React.Component {
    resolutionSelect() {
      const { aspectRatio, resolution, change } = this.props;

      const resolutionOptions = resolutions[aspectRatio].map(([x, y], i) =>
        e('option', {
          value: i,
          key: i,
        }, `${x}x${y}`)
      );

      const resIndex = resolutions[aspectRatio].findIndex(([x, y]) =>
        x === resolution[0] && y === resolution[1]
      );

      const resolutionSelect = e('select', {
        value: resIndex,
        onChange: e => {
          click++;
          change(aspectRatio, resolutions[aspectRatio][parseInt(e.target.value)]);
        },
        key: 1,
      }, resolutionOptions);

      return resolutionSelect;
    }

    resolutionInput() {
      const { aspectRatio, resolution, change } = this.props;

      const xInput = e(StringInput, {
        size: 3,
        value: resolution[0],
        change: v => {
          change(aspectRatio, [ parseInt(v), resolution[1] ]);
        },
        key: 0,
      });

      const yInput = e(StringInput, {
        size: 3,
        value: resolution[1],
        change: v => {
          change(aspectRatio, [ resolution[0], parseInt(v) ]);
        },
        key: 1,
      });

      return e('span', { key: 2 }, [ xInput, 'x', yInput ]);
    }

    render() {
      const { text, aspectRatio, resolution, change } = this.props;

      const aspectOptions = [
        [ aspectRatios.r16x9, '16:9' ],
        [ aspectRatios.r4x3, '4:3' ],
        [ aspectRatios.other, 'Custom' ],
      ].map(([value, text]) => e('option', {
        value,
        key: value,
      }, text));

      const aspectSelect = e('select', {
        value: aspectRatio,
        onChange: e => {
          click++;
          const ar = e.target.value;
          const res = resolutions.hasOwnProperty(ar) ?
            resolutions[ar][0] : resolution;
          change(ar, res);
        },
        key: 0,
      }, aspectOptions);

      return e('div', {}, [
        text,
        aspectSelect,
        aspectRatio === aspectRatios.other ?
          this.resolutionInput() : this.resolutionSelect(),
      ]);
    }
  }

  const mapStateToProps = state => ({
    aspectRatio: state.aspectRatio,
    resolution: state.resolution,
  });

  const mapDispatchToProps = dispatch => ({
    change: (aspectRatio, resolution) =>
      dispatch({ type: 'UPDATE_PROPS', props: { aspectRatio, resolution }, click }),
  });

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(ResolutionPicker);
})();