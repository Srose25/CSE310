(() => {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const goal = params.get('goal')?.trim() || 'Settle in.';
  const requestedMinutes = Number(params.get('duration'));
  const durationMinutes = Number.isFinite(requestedMinutes) && requestedMinutes >= 1 && requestedMinutes <= 240
    ? requestedMinutes
    : 25;
  const ambience = params.get('ambience') || 'none';
  const ambienceTracks = {
    song1: { name: 'In Between Spaces', src: 'assets/dark-aero1.mp3' },
    song2: { name: 'Locked In', src: 'assets/dark-aero2.mp3' },
    song3: { name: 'The Search', src: 'assets/dark-aero3.mp3' },
    song4: { name: 'Flow State', src: 'assets/frutiger-aero1.mp3' },
    song5: { name: 'In the Depths', src: 'assets/frutiger-aero2.mp3' }
  };

  const page = document.querySelector('.timer-page');
  const goalTitle = document.querySelector('.session-goal');
  const timeRemaining = document.querySelector('#time-remaining');
  const progressRing = document.querySelector('.timer-ring-progress');
  const pauseButton = document.querySelector('#pause-button');
  const endButton = document.querySelector('#end-button');
  const soundButton = document.querySelector('#sound-button');
  const ambienceName = document.querySelector('#ambience-name');
  const completion = document.querySelector('#completion-message');
  const reflectButton = document.querySelector('#reflect-button');
  const timerControls = document.querySelector('.timer-controls');
  const ambiencePanel = document.querySelector('.ambience-panel');
  const circleLength = 2 * Math.PI * 105;

  let remainingSeconds = durationMinutes * 60;
  let endTime = Date.now() + remainingSeconds * 1000;
  let timerId;
  let isPaused = false;
  let isComplete = false;
  let ambienceAudio;
  let alarmAudio;
  let ambienceWasPlayingBeforePause = false;

  progressRing.style.strokeDasharray = String(circleLength);
  goalTitle.textContent = goal;
  ambienceName.textContent = ambienceTracks[ambience]?.name || 'None';
  reflectButton.href = `page-3.html?goal=${encodeURIComponent(goal)}&duration=${durationMinutes}&ambience=${encodeURIComponent(ambience)}`;

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secondsPart = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secondsPart).padStart(2, '0')}`;
  }

  function updateTimer() {
    if (isPaused || isComplete) return;
    remainingSeconds = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    const elapsedRatio = 1 - (remainingSeconds / (durationMinutes * 60));
    progressRing.style.strokeDashoffset = String(circleLength * elapsedRatio);
    timeRemaining.textContent = formatTime(remainingSeconds);
    timeRemaining.dateTime = `PT${Math.floor(remainingSeconds / 60)}M${remainingSeconds % 60}S`;

    page.classList.toggle('timer-halfway', elapsedRatio >= 0.5 && elapsedRatio < 0.85);
    page.classList.toggle('timer-nearly-done', elapsedRatio >= 0.85);

    if (remainingSeconds === 0) completeSession();
  }

  // Plays the completion alarm once. The audio file is not altered.
  function chime() {
    if (!alarmAudio) {
      alarmAudio = new Audio('assets/frutiger-alarm.mp3');
      alarmAudio.preload = 'auto';
      alarmAudio.loop = false;
    }

    alarmAudio.currentTime = 0;
    alarmAudio.play().catch(() => {
      // Playback can be blocked until the visitor has interacted with the page.
    });
  }

  
  function completeSession() {
    if (isComplete) return;
    isComplete = true;
    clearInterval(timerId);
    stopAmbience();
    page.classList.add('timer-complete');
    timerControls.hidden = true;
    ambiencePanel.hidden = true;
    completion.hidden = false;
    chime();
  }

  function togglePause() {
    if (isPaused) {
      isPaused = false;
      endTime = Date.now() + remainingSeconds * 1000;
      pauseButton.textContent = 'Pause session';
      timerId = window.setInterval(updateTimer, 250);
      updateTimer();
      if (ambienceWasPlayingBeforePause) startAmbience();
    } else {
      isPaused = true;
      clearInterval(timerId);
      pauseButton.textContent = 'Resume session';
      ambienceWasPlayingBeforePause = Boolean(ambienceAudio && !ambienceAudio.paused);
      if (ambienceWasPlayingBeforePause) ambienceAudio.pause();
    }
  }

  /* Previous white-noise ambience generator (kept disabled):
  function startAmbience() {
    audioContext = new AudioContext();
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let index = 0; index < bufferSize; index += 1) samples[index] = (Math.random() * 2 - 1) * 0.16;

    const source = audioContext.createBufferSource();
    const filter = audioContext.createBiquadFilter();
    const gain = audioContext.createGain();
    source.buffer = buffer;
    source.loop = true;
    filter.type = ambience === 'waves' ? 'lowpass' : 'bandpass';
    filter.frequency.value = ambience === 'rain' ? 2600 : ambience === 'cafe' ? 900 : 550;
    gain.gain.value = 0.22;
    source.connect(filter).connect(gain).connect(audioContext.destination);
    source.start();
    ambienceNode = audioContext;
    soundButton.textContent = 'Mute ambience';
  }
  */

  // Plays the selected MP3 and restarts it whenever it finishes.
  function startAmbience() {
    const track = ambienceTracks[ambience];
    if (!track) return;

    if (!ambienceAudio) {
      const audio = new Audio(track.src);
      audio.preload = 'auto';
      audio.addEventListener('ended', () => {
        if (isComplete || ambienceAudio !== audio) return;
        audio.currentTime = 0;
        audio.play().catch(() => {
          // The sound button remains available if the browser blocks playback.
        });
      });
      ambienceAudio = audio;
    }

    ambienceAudio.play().then(() => {
      soundButton.textContent = 'Mute ambience';
    }).catch(() => {
      soundButton.textContent = 'Play ambience';
    });
  }

  function stopAmbience() {
    if (!ambienceAudio) return;
    ambienceAudio.pause();
    ambienceAudio.currentTime = 0;
    ambienceAudio = undefined;
    ambienceWasPlayingBeforePause = false;
    soundButton.textContent = 'Play ambience';
  }

  pauseButton.addEventListener('click', togglePause);
  endButton.addEventListener('click', completeSession);
  soundButton.addEventListener('click', () => {
    if (ambienceAudio && !ambienceAudio.paused) stopAmbience();
    else startAmbience();
  });

  if (ambienceTracks[ambience]) {
    soundButton.disabled = false;
    soundButton.textContent = 'Play ambience';
  }

  updateTimer();
  timerId = window.setInterval(updateTimer, 250);
})();
