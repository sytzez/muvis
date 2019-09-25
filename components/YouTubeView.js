const YouTubeView = (() => {
  'use strict';

  const e = React.createElement;

  class YouTubeView extends React.Component {
    iframe = React.createRef();
    input = React.createRef();
    player = null; // player.loadVideoByUrl
    // pauseVideo() playVideo seekTo(seconds, false)

    loadVideo(url) {
      this.player.loadVideoByUrl(url);
    }

    onStateChange(e) {
      // e.data; // -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued
      const { player } = this;
      const { url } = this.props;

      if (player.getVideoUrl() !== this.url) {
        this.loadVideo(url);
        return;
      }

      hotPlayback.setTime(player.getCurrentTime);

      // TODO set store time? if not playing
      
      if (e.data === YT.PlayerState.PLAYING)
        hotPlayback.start();
      else
        hotPlayback.pause();
    }

    componentDidMount() {
      if (typeof YT === 'undefined') return;

      const { url } = this.props;

      this.player = new YT.Player(iframe.current, {
        videoUrl: url,
        events: {
          'onStateChange': this.onStateChange.bind(this),
        },
      });
    }

    render() {
      if (typeof YT === 'undefined') return 'YouTube API failed to load...';

      const { url, setUrl } = this.props;

      return e('div', {
      }, [
        e('input', {
          ref: this.input,
          value: url,
          key: 0,
        }),
        e('button', {
          onClick: (() => {
            setUrl(this.input.current.value);
          }).bind(this),
          key: 1,
        }, 'Open'),
        e('iframe', {
          ref: this.iframe,
          key: 1,
        }),
      ]);
    }
  }

  const mapStateToProps = state => ({
    url: state.ytUrl,
  });

  const mapDispatchToProps = dispatch => ({
    setUrl: (ytUrl) => dispatch({ type: 'UPDATE_PROPS', props: { ytUrl } }),
  });

  return ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps,
  )(YouTubeView);
})();