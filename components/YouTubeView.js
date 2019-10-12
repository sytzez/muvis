const YouTubeView = (() => {
  'use strict';

  const e = React.createElement;

  class YouTubeView extends React.Component {
    iframe = null;
    iframeParent = React.createRef();
    player = null;
    timeCallback = this.time.bind(this);
    qualityChanged = false;
    keyEvent = this.onKeyPress.bind(this);

    state = {
      error: '',
    }

    onKeyPress(e) {
      if (e.keyCode === 32) {
        e.preventDefault();
        const { player } = this;
        if (player) {
          const state = player.getPlayerState();
          if (state === YT.PlayerState.PAUSED ||
            state === YT.PlayerState.CUED)
            player.playVideo();
          else if (state === YT.PlayerState.PLAYING)
            player.pauseVideo();
        } else {
          if (hotPlayback.isPlaying())
            hotPlayback.pause();
          else 
            hotPlayback.start();
        }
      }
    }

    step(amount) {
      const { player } = this;
      if (player && player.getPlayerState() === YT.PlayerState.PAUSED) {
        const t = this.player.getCurrentTime() + amount;
        player.seekTo(t, true);
        hotPlayback.setTime(t);
      } else {
        hotPlayback.setTime(hotPlayback.getTime() + amount);
      }
    }

    loadVideo(url) {
      const { player } = this;
      this.qualityChanged = false;
      if (!player)
        this.initVideo();
      else
        player.loadVideoByUrl(url, hotPlayback.getTime(), 'small');
    }

    time(t) {
      const { player } = this;
      if (!player) return;
      if (player.getPlayerState() === YT.PlayerState.PAUSED)
        player.seekTo(t, true);
      else if (player.getPlayerState() === YT.PlayerState.PLAYING) {
        const ytt = player.getCurrentTime();
        if (Math.abs(ytt - t) > 0.05)
          hotPlayback.setTime(ytt);
      }
    }

    onStateChange(e) {
      console.log(e);

      const { player } = this;
      const { url } = this.props;

      if (!this.qualityChanged && player.getPlaybackQuality() !== 'small') {
        player.setPlaybackQuality('small');
        this.qualityChanged = true;
      }

      // if (player.getVideoUrl() !== this.url && e.data === YT.PlayerState.PAUSED) {
      //   this.loadVideo(url);
      //   return;
      // }

      console.log(player.getCurrentTime());
      hotPlayback.setTime(player.getCurrentTime()); // TODO: respond to video speed

      // TODO set store time? if not playing
      
      if (e.data === YT.PlayerState.PLAYING)
        hotPlayback.start();
      else if (e.data === YT.PlayerState.PAUSED ||
        e.date === YT.PlayerState.ENDED)
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

      this.player.destroy();
      this.player = null;
      this.iframe = document.createElement('div');
      this.iframeParent.current.appendChild(this.iframe);
    }

    componentDidMount() {
      this.iframe = document.createElement('div');
      this.iframeParent.current.appendChild(this.iframe);
      hotPlayback.addListener(this.timeCallback);
      window.addEventListener('keydown', this.keyEvent);

      if (this.props.url !== '')
        this.loadVideo(this.props.url);
    }

    componentWillUnmount() {
      if (this.player) this.player.destroy();
      hotPlayback.removeListener(this.timeCallback);
      window.removeEventListener('keydown', this.keyEvent);
    }

    initVideo() {
      if (typeof YT === 'undefined') return;

      const { url } = this.props;

      let id = url.slice(url.indexOf('v=') + 2);
      const i = id.indexOf('&');
      if (i !== -1) id = id.slice(0, i);
      console.log(id);

      this.setState({ error: '' });

      this.player = new YT.Player(this.iframe, {
        videoId: id,
        width: 250,
        height: 200,
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
      const { iframeParent } = this;

      if (typeof YT === 'undefined') return 'YouTube API failed to load...';

      return e('div', {
      }, [
        e('input', {
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
        (error !== '') ? e('div', {
          className: 'error',
          key: 1.5,
        }, `Error: ${error}`) : null,
        e('div', {
          ref: iframeParent,
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