const hotPlayback = ((store) => {
  'use strict';
  
  let listeners = [];
  let time = 0.0;
  let zeroTime = 0.0;
  let startTime = 0.0;
  let storeTime = 0.0; // last time the store was updated
  let interval = 0;

  function addListener(func) {
    listeners.push(func);
  }

  function removeListener(func) {
    listeners = listeners.filter(f => f !== func);
  }

  function start() {
    if (interval !== 0) return;
    
    startTime = storeTime = performance.now();
    zeroTime = time;
    step();
    interval = setInterval(step, 1000 / 15);
  }

  function stop() {
    pause();
    time = 0.0;
    listeners.forEach(f => f(time));
  }

  function isPlaying() {
    return interval !== 0;
  }

  function pause() {
    if (interval === 0) return;
    
    clearInterval(interval);
    interval = 0;
  }

  function step() {
    const now = performance.now();
    
    time = zeroTime + (now - startTime) * 0.001;
    
    listeners.forEach(f => f(time));

    if (now > storeTime + 1000) {
      storeTime = now;
      store.dispatch({type: 'SET_TIME', time, hot: false});
    }
  }

  function getTime() {
    if (interval === 0)
      return time;
    else 
      return zeroTime + (performance.now() - startTime) * 0.001;
  }

  function setTime(t) {
    const now = performance.now();

    time = zeroTime = t;
    startTime = now;
    
    if (now > storeTime + 1000) {
      storeTime = now;
      store.dispatch({type: 'SET_TIME', time, hot: false});
    }

    listeners.forEach(f => f(time));
  }

  return {
    addListener,
    removeListener,
    start,
    stop,
    isPlaying,
    pause,
    setTime,
    getTime,
  };
})(store);

// store.dispatch({type: 'SET_HOT_PLAYBACK', hotPlayback});