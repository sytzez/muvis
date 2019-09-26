const YouTubeView = (() => {
  'use strict';

  const e = React.createElement;

  class YouTubeView extends React.Component {
    iframe = React.createRef();
    input = React.createRef();
    player = null;

    state = {
      error: '',
    }

    step(amount) {
      if (this.player) {
        const t = this.player.getCurrentTime() + amount;
        this.player.seekTo(t);
        hotPlayback.setTime(t);
      } else {
        hotPlayback.setTime(hotPlayback.getTime() + amount);
      }
    }

    loadVideo(url) {
      if (!this.player)
        this.initVideo();
      else
        this.player.loadVideoByUrl(url, hotPlayback.getTime(), 'small');
    }

    onStateChange(e) {
      // e.data; // -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued
      console.log(e);

      const { player } = this;
      const { url } = this.props;

      if (player.getVideoUrl() !== this.url && e.data === YT.PlayerState.PAUSED) {
        //this.loadVideo(url);
        //return;
      }

      hotPlayback.setTime(player.getCurrentTime()); // TODO: respond to video speed

      // TODO set store time? if not playing
      
      if (e.data === YT.PlayerState.PLAYING)
        hotPlayback.start();
      else if (e.data === YT.PlayerState.PAUSED)
        hotPlayback.pause();
    }

    onError(e) {
      switch(e.data) {
        case 2:
          this.setState({ error: 'Invalid id' });
          break;
        case 5:
          this.setState({ error: 'HTML5 Player error' });
          break;
        case 100:
          this.setState({ error: 'Video could not be found' });
          break;
        case 150: case 101:
          this.setState({ error: 'Video doesn\'t allow embedding' });
          break;
        default:
          this.setState({ error: 'Unknown' });
      }

      // this.player.destroy();
      // this.player = null;
    }

    initVideo() {
      if (typeof YT === 'undefined') return;

      const { url } = this.props;

      let id = url.slice(url.indexOf('v=') + 2);
      const i = id.indexOf('&');
      if (i !== -1) id = id.slice(0, i);
      console.log(id);

      this.setState({ error: '' });

      this.player = new YT.Player(this.iframe.current, {
        videoId: id,
        width: 200,
        height: 150,
        suggestedQuality: 'small',
        events: {
          'onStateChange': this.onStateChange.bind(this),
          'onError': this.onError.bind(this),
        },
      });
    }

    render() {
      const { url, setUrl } = this.props;
      const { error } = this.state;

      if (typeof YT === 'undefined') return 'YouTube API failed to load...';

      return e('div', {
      }, [
        e('input', {
          ref: this.input,
          size: 14,
          value: url,
          placeholder: 'YouTube URL',
          onChange: (e) => setUrl(e.target.value),
          key: 0,
        }),
        e('button', {
          onClick: (() => {
            if (url !== '') this.loadVideo(url);
          }).bind(this),
          key: 1,
        }, 'Load'),
        (error !== '') ? `Error: ${error}` : null,
        e('div', {
          ref: this.iframe,
          key: 2,
        }),
        e('button', {
          onClick: (() => {
            this.step(-0.1);
          }).bind(this),
          key: 3,
        },'<<'),
        'step',
        e('button', {
          onClick: (() => {
            this.step(0.1);
          }).bind(this),
          key: 4,
        },'>>'),
        (url === '') ? e(PlaybackControls, {key: 10}) : null,
        e(TimeDisplay, {key: 11}),
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