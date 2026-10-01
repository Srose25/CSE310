(() => {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const goal = params.get('goal')?.trim() || 'Settle in.';
  const requestedMinutes = Number(params.get('duration'));
  const durationMinutes = Number.isFinite(requestedMinutes) && requestedMinutes >= 1 && requestedMinutes <= 240
    ? requestedMinutes
    : 25;
  const ambience = params.get('ambience') || 'none';
  const ambienceNames = {
    rain: 'Gentle rain', 
    forest: 'Forest morning', 
    cafe: 'Quiet café', 
    waves: 'Ocean waves', 
    none: 'None'
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
  let audioContext;
  let ambienceNode;

  progressRing.style.strokeDasharray = String(circleLength);
  goalTitle.textContent = goal;
  ambienceName.textContent = ambienceNames[ambience] || 'None';
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

  //This function needs to be removed.
  function chime() {
    const context = new AudioContext();
    [523.25, 659.25, 783.99].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, context.currentTime + index * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + index * 0.18 + 0.7);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(context.currentTime + index * 0.18);
      oscillator.stop(context.currentTime + index * 0.18 + 0.7);
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
      if (ambienceNode) ambienceNode.resume();
    } else {
      isPaused = true;
      clearInterval(timerId);
      pauseButton.textContent = 'Resume session';
      if (ambienceNode) ambienceNode.suspend();
    }
  }

  // A soft synthesized noise bed avoids an external audio dependency.
  // Browsers require a direct click before audio can start.

  //This Function needs to be replaced with an audio player
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

  function stopAmbience() {
    if (!ambienceNode) return;
    ambienceNode.close();
    ambienceNode = undefined;
    soundButton.textContent = 'Play ambience';
  }

  pauseButton.addEventListener('click', togglePause);
  endButton.addEventListener('click', completeSession);
  soundButton.addEventListener('click', () => ambienceNode ? stopAmbience() : startAmbience());

  if (ambience !== 'none' && ambienceNames[ambience]) {
    soundButton.disabled = false;
    soundButton.textContent = 'Play ambience';
  }

  updateTimer();
  timerId = window.setInterval(updateTimer, 250);
})();
