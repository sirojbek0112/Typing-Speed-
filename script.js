/* =========================================================
   TYPING SPEED — SCRIPT (MOBILE-OPTIMIZED)
   Vanilla JavaScript
   ========================================================= */

(function () {
  'use strict';

  const $ = function (s, r) { return (r || document).querySelector(s); };
  const $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  const LS_SETTINGS = 'typingSpeed.settings.v1';
  const LS_HISTORY  = 'typingSpeed.history.v1';
  const HISTORY_LIMIT = 100;

  /* ---------- TEXT POOLS ---------- */
  const TEXTS = {
    easy: [
      'The sun is hot and the sky is blue.',
      'My dog can run fast in the park.',
      'I like to eat bread with jam.',
      'She has a small red ball.',
      'We can go to the big lake.',
      'The boy and the girl play all day.',
      'A cat sat on a warm mat.',
      'He can ride a bike to town.',
      'The old man has a new hat.',
      'I see two birds on the tree.',
      'They sing a song in the car.',
      'Let us walk to the shop now.'
    ],
    medium: [
      'The quick brown fox jumps over the lazy dog while the sun sets slowly.',
      'Learning to type without looking at the keyboard takes time and daily practice.',
      'A good breakfast gives you energy for the whole working day ahead.',
      'The library was quiet except for the soft sound of turning pages.',
      'She opened the window and felt the cool morning air on her face.',
      'Programming is the art of telling a computer what to do step by step.',
      'Every journey begins with a single step, so keep moving forward.',
      'The train arrived exactly on time despite the heavy rain outside.',
      'Reading books every day helps you build a stronger vocabulary.',
      'He wrote a long letter and sent it to his best friend abroad.',
      'The little cafe on the corner serves the best coffee in town.',
      'Practice makes perfect when you stay focused and patient.'
    ],
    hard: [
      'Although the experiment failed twice, Dr. Reynolds remained confident; after all, genuine discovery rarely follows a straight line.',
      'In 1969, the Apollo 11 mission proved that humanity\'s boldest dreams could, with enough discipline, become undeniable reality.',
      'The committee\'s final decision (announced at 4:30 p.m.) surprised everyone who had followed the debate closely.',
      'Modern cryptography relies on mathematics so complex that even the fastest supercomputers require centuries to break it.',
      'By the autumn of 2024, renewable energy sources supplied nearly half of the country\'s total electricity demand.',
      'Writing clean, maintainable code is far more valuable than writing clever code that nobody else can understand.',
      'The historian argued — quite convincingly — that economic factors, not ideology, drove the revolution forward.',
      'Whatever you decide, remember this: consistency, patience, and focus will always outperform raw talent in the long run.',
      'Quantum computers manipulate qubits, which can exist in multiple states simultaneously; classical bits cannot do that.',
      'After years of relentless practice, the young pianist performed Chopin\'s most demanding étude without a single mistake.',
      'Scientists studying deep-sea ecosystems have discovered organisms that survive extreme pressure, darkness, and near-freezing temperatures.',
      'The startup\'s founders believed that a simple, well-designed product would beat a complicated one every single time.'
    ]
  };

  /* ---------- DOM ---------- */
  const pages        = $$('.page');
  const navBtns      = $$('.nav-btn');
  const logoBtn      = $('#logoBtn');
  const themeToggle  = $('#themeToggle');

  const timeChips    = $('#timeChips');
  const diffChips    = $('#diffChips');
  const startBtn     = $('#startBtn');
  const homeBestWpm  = $('#homeBestWpm');

  const statWpm      = $('#statWpm');
  const statAcc      = $('#statAcc');
  const statErr      = $('#statErr');
  const statTime     = $('#statTime');
  const progressBar  = $('#progressBar');

  const typingCard   = $('#typingCard');
  const typingText   = $('#typingText');
  const typingOverlay= $('#typingOverlay');
  const overlayText  = $('#overlayText');
  const hiddenInput  = $('#hiddenInput');

  const pauseBtn     = $('#pauseBtn');
  const restartBtn   = $('#restartBtn');
  const newTextBtn   = $('#newTextBtn');
  const homeBtn2     = $('#homeBtn2');

  const statCards    = $('#statCards');
  const historyBody  = $('#historyBody');
  const clearHistoryBtn = $('#clearHistoryBtn');

  const themeChips   = $('#themeChips');
  const soundSwitch  = $('#soundSwitch');
  const resetStatsBtn= $('#resetStatsBtn');

  const resultModal  = $('#resultModal');
  const recordBadge  = $('#recordBadge');
  const resWpm       = $('#resWpm');
  const resAcc       = $('#resAcc');
  const resErr       = $('#resErr');
  const resCorrect   = $('#resCorrect');
  const resTotal     = $('#resTotal');
  const resTime      = $('#resTime');
  const resDiff      = $('#resDiff');
  const tryAgainBtn  = $('#tryAgainBtn');
  const newTestBtn   = $('#newTestBtn');
  const backHomeBtn  = $('#backHomeBtn');

  const countdownEl  = $('#countdown');
  const countdownNum = $('#countdownNum');
  const toastEl      = $('#toast');

  /* ---------- STATE ---------- */
  const state = {
    duration: 15,
    difficulty: 'easy',
    target: '',
    typed: '',
    chars: [],
    running: false,
    paused: false,
    finished: false,
    elapsed: 0,
    lastTick: 0,
    keystrokes: 0,
    errors: 0,
    timerId: null,
    countdownId: null
  };

  const settings = { theme: 'dark', sound: true, duration: 15, difficulty: 'easy' };

  let currentPage = 'home';
  let lastScrollIndex = -1;
  let toastTimer = null;

  /* ---------- STORAGE ---------- */
  function loadSettings() {
    try {
      const raw = localStorage.getItem(LS_SETTINGS);
      if (!raw) return;
      const p = JSON.parse(raw);
      if (p && typeof p === 'object') {
        if (p.theme === 'dark' || p.theme === 'light') settings.theme = p.theme;
        if (typeof p.sound === 'boolean') settings.sound = p.sound;
        if ([15,30,60].indexOf(Number(p.duration)) !== -1) settings.duration = Number(p.duration);
        if (['easy','medium','hard'].indexOf(p.difficulty) !== -1) settings.difficulty = p.difficulty;
      }
    } catch (e) {}
  }
  function saveSettings() {
    try { localStorage.setItem(LS_SETTINGS, JSON.stringify(settings)); } catch (e) {}
  }
  function loadHistory() {
    try {
      const raw = localStorage.getItem(LS_HISTORY);
      if (!raw) return [];
      const p = JSON.parse(raw);
      return Array.isArray(p) ? p : [];
    } catch (e) { return []; }
  }
  function saveHistory(h) {
    try { localStorage.setItem(LS_HISTORY, JSON.stringify(h)); } catch (e) {}
  }

  /* ---------- SOUND ---------- */
  let audioCtx = null;
  function getAudioCtx() {
    if (!settings.sound) return null;
    try {
      if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        audioCtx = new AC();
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return audioCtx;
    } catch (e) { return null; }
  }
  function beep(freq, dur, vol, type, delay) {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const t = ctx.currentTime + (delay || 0);
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(vol, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(t); osc.stop(t + dur + 0.02);
    } catch (e) {}
  }
  function playKeySound(ok) {
    if (!settings.sound) return;
    if (ok) beep(660 + Math.random() * 140, 0.05, 0.03, 'triangle', 0);
    else    beep(150, 0.12, 0.06, 'sawtooth', 0);
  }
  function playFinishSound() {
    if (!settings.sound) return;
    [523.25, 659.25, 783.99].forEach(function (n, i) { beep(n, 0.2, 0.05, 'sine', i * 0.11); });
  }
  function playRecordSound() {
    if (!settings.sound) return;
    [659.25, 783.99, 987.77, 1318.51].forEach(function (n, i) { beep(n, 0.22, 0.055, 'triangle', i * 0.1); });
  }

  /* ---------- TOAST ---------- */
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 2200);
  }

  /* ---------- THEME ---------- */
  function applyTheme(theme) {
    settings.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#070b16' : '#eef2fb');
    themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
    $$('[data-theme-set]').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-theme-set') === theme);
    });
    saveSettings();
  }

  /* ---------- NAVIGATION ---------- */
  function setPage(page) {
    currentPage = page;
    pages.forEach(function (p) { p.classList.toggle('is-active', p.id === 'page-' + page); });
    navBtns.forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-page') === page); });
  }

  function navigate(page) {
    if (page === currentPage && page !== 'practice') return;

    if (currentPage === 'practice' && page !== 'practice') {
      if (state.running && !state.paused) togglePause();
      cancelCountdown();
    }

    setPage(page);

    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); }

    if (page === 'statistics') renderStatistics();

    if (page === 'practice' && !state.paused && !state.running && !state.countdownId) {
      startTest(true);
    }
  }

  /* ---------- TEXT GENERATION ---------- */
  function buildText(diff, dur) {
    const pool = TEXTS[diff] || TEXTS.medium;
    const need = Math.max(120, Math.round(dur * 8));
    let out = '';
    let lastIdx = -1;
    let guard = 0;
    while (out.length < need && guard < 300) {
      guard++;
      let idx = Math.floor(Math.random() * pool.length);
      if (pool.length > 1 && idx === lastIdx) idx = (idx + 1) % pool.length;
      lastIdx = idx;
      out += (out ? ' ' : '') + pool[idx];
    }
    return out;
  }

  /* ---------- RENDER ---------- */
  function renderChars() {
    typingText.innerHTML = '';
    state.chars = [];
    lastScrollIndex = -1;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < state.target.length; i++) {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = state.target.charAt(i);
      frag.appendChild(span);
      state.chars.push(span);
    }
    typingText.appendChild(frag);
    typingText.scrollTop = 0;
  }

  function updateUI() {
    const target = state.target;
    const typed = state.typed;
    const chars = state.chars;
    const len = chars.length;
    for (let i = 0; i < len; i++) {
      const el = chars[i];
      let cls;
      if (i < typed.length) {
        cls = typed.charAt(i) === target.charAt(i) ? 'char correct' : 'char incorrect';
      } else if (i === typed.length) {
        cls = 'char current';
      } else {
        cls = 'char';
      }
      if (el.className !== cls) el.className = cls;
    }
    scrollToCurrent();
  }

  function scrollToCurrent() {
    const idx = state.typed.length;
    if (idx === lastScrollIndex) return;
    lastScrollIndex = idx;
    const el = state.chars[idx];
    if (!el) return;
    const vTop = typingText.scrollTop;
    const vH = typingText.clientHeight;
    const vBottom = vTop + vH;
    const eTop = el.offsetTop;
    const eH = el.offsetHeight || 24;
    if (eTop < vTop || eTop + eH > vBottom - 6) {
      typingText.scrollTop = Math.max(0, eTop - vH / 2 + eH / 2);
    }
  }

  /* ---------- STATS ---------- */
  function updateStats() {
    const ks = state.keystrokes;
    const err = state.errors;
    const correct = Math.max(0, ks - err);
    const minutes = Math.max(state.elapsed, 1000) / 60000;
    const wpm = Math.round((correct / 5) / minutes);
    const acc = ks > 0 ? Math.round((correct / ks) * 100) : 100;
    const leftMs = Math.max(0, state.duration * 1000 - state.elapsed);

    statWpm.textContent = String(wpm);
    statAcc.textContent = acc + '%';
    statErr.textContent = String(err);
    statTime.textContent = Math.ceil(leftMs / 1000) + 's';

    const progress = Math.min(100, (state.elapsed / (state.duration * 1000)) * 100);
    progressBar.style.width = progress + '%';
  }

  function resetStats() {
    statWpm.textContent = '0';
    statAcc.textContent = '100%';
    statErr.textContent = '0';
    statTime.textContent = state.duration + 's';
    progressBar.style.width = '0%';
  }

  /* ---------- TIMER ---------- */
  function tick() {
    if (!state.running || state.paused || state.finished) return;
    const now = performance.now();
    state.elapsed += now - state.lastTick;
    state.lastTick = now;
    if (state.elapsed >= state.duration * 1000) {
      state.elapsed = state.duration * 1000;
      updateStats();
      finishTest();
      return;
    }
    updateStats();
  }

  /* ---------- COUNTDOWN ---------- */
  function bumpCountdown() {
    countdownNum.classList.remove('pop');
    void countdownNum.offsetWidth;
    countdownNum.classList.add('pop');
  }

  function runCountdown(done) {
    const seq = ['3', '2', '1', 'GO!'];
    let i = 0;
    countdownEl.classList.add('is-visible');
    countdownNum.textContent = seq[0];
    bumpCountdown();
    const id = setInterval(function () {
      i++;
      if (i >= seq.length) {
        clearInterval(id);
        countdownEl.classList.remove('is-visible');
        done();
        return;
      }
      countdownNum.textContent = seq[i];
      bumpCountdown();
    }, 550);
    return id;
  }

  function cancelCountdown() {
    if (state.countdownId) {
      clearInterval(state.countdownId);
      state.countdownId = null;
    }
    countdownEl.classList.remove('is-visible');
  }

  /* ---------- FOCUS HELPER (mobile uchun muhim) ---------- */
  function focusInput() {
    try {
      hiddenInput.focus({ preventScroll: true });
    } catch (e) {
      try { hiddenInput.focus(); } catch (e2) {}
    }
  }

  /* ---------- TEST LIFECYCLE ---------- */
  function startTest(newText) {
    cancelCountdown();
    clearInterval(state.timerId);
    state.timerId = null;
    hideResult();

    setPage('practice');

    if (newText || !state.target) {
      state.target = buildText(state.difficulty, state.duration);
      renderChars();
    }

    state.typed = '';
    state.elapsed = 0;
    state.keystrokes = 0;
    state.errors = 0;
    state.running = false;
    state.paused = false;
    state.finished = false;
    state.lastTick = 0;

    hiddenInput.value = '';

    pauseBtn.textContent = 'Pause';
    typingCard.classList.remove('is-paused', 'is-blurred');
    overlayText.textContent = 'Yozish uchun bosing';

    updateUI();
    resetStats();

    /* MUHIM: mobil klaviatura ochilishi uchun darhol focus */
    focusInput();

    state.countdownId = runCountdown(function () {
      state.countdownId = null;
      beginTest();
    });
  }

  function beginTest() {
    state.running = true;
    state.paused = false;
    state.lastTick = performance.now();
    typingCard.classList.remove('is-blurred');
    overlayText.textContent = 'Yozish uchun bosing';

    focusInput();

    clearInterval(state.timerId);
    state.timerId = setInterval(tick, 50);
  }

  function togglePause() {
    if (!state.running || state.finished) return;
    state.paused = !state.paused;

    if (state.paused) {
      pauseBtn.textContent = 'Resume';
      typingCard.classList.add('is-paused');
      typingCard.classList.remove('is-blurred');
      overlayText.textContent = '⏸ Pauza — davom etish uchun bosing';
      hiddenInput.blur();
    } else {
      pauseBtn.textContent = 'Pause';
      typingCard.classList.remove('is-paused');
      state.lastTick = performance.now();
      focusInput();
    }
  }

  function finishTest() {
    if (state.finished) return;
    state.finished = true;
    state.running = false;
    state.paused = false;

    clearInterval(state.timerId);
    state.timerId = null;

    typingCard.classList.remove('is-paused', 'is-blurred');
    hiddenInput.blur();

    const ks = state.keystrokes;
    const err = state.errors;
    const correct = Math.max(0, ks - err);
    const elapsedSec = Math.max(1, Math.round(state.elapsed / 1000));
    const minutes = Math.max(state.elapsed, 1000) / 60000;
    const wpm = Math.round((correct / 5) / minutes);
    const acc = ks > 0 ? Math.round((correct / ks) * 100) : 100;

    const result = {
      date: Date.now(),
      wpm: wpm,
      accuracy: acc,
      errors: err,
      correct: correct,
      total: ks,
      duration: elapsedSec,
      limit: state.duration,
      difficulty: state.difficulty
    };

    const isRecord = saveResult(result);
    updateHomeBest();
    renderStatistics();
    showResult(result, isRecord);
  }

  /* ---------- INPUT HANDLING ---------- */
  function handleInput() {
    if (!state.running || state.paused || state.finished) {
      hiddenInput.value = state.typed;
      return;
    }

    let val = hiddenInput.value;
    const target = state.target;

    if (val.length > target.length) val = val.slice(0, target.length);

    const prev = state.typed;

    if (val.length > prev.length && val.indexOf(prev) === 0) {
      const added = val.length - prev.length;
      for (let i = prev.length; i < val.length; i++) {
        state.keystrokes++;
        const ok = val.charAt(i) === target.charAt(i);
        if (!ok) state.errors++;
        if (added === 1) playKeySound(ok);
      }
    }

    state.typed = val;

    if (hiddenInput.value !== val) hiddenInput.value = val;

    try { hiddenInput.setSelectionRange(val.length, val.length); } catch (e) {}

    updateUI();
    updateStats();

    if (val.length >= target.length && target.length > 0) finishTest();
  }

  /* ---------- RESULT / HISTORY ---------- */
  function saveResult(r) {
    const history = loadHistory();
    let prevBest = 0;
    for (let i = 0; i < history.length; i++) {
      if (history[i] && history[i].wpm > prevBest) prevBest = history[i].wpm;
    }
    history.unshift(r);
    if (history.length > HISTORY_LIMIT) history.length = HISTORY_LIMIT;
    saveHistory(history);
    return prevBest > 0 && r.wpm > prevBest;
  }

  function showResult(r, isRecord) {
    resWpm.textContent = String(r.wpm);
    resAcc.textContent = r.accuracy + '%';
    resErr.textContent = String(r.errors);
    resCorrect.textContent = String(r.correct);
    resTotal.textContent = String(r.total);
    resTime.textContent = r.duration + ' sec';
    resDiff.textContent = r.difficulty.charAt(0).toUpperCase() + r.difficulty.slice(1);
    recordBadge.classList.toggle('is-visible', !!isRecord);
    resultModal.classList.add('is-visible');
    if (isRecord) {
      playRecordSound();
      showToast('🏆 Yangi rekord: ' + r.wpm + ' WPM!');
    } else {
      playFinishSound();
    }
  }

  function hideResult() { resultModal.classList.remove('is-visible'); }

  /* ---------- STATISTICS ---------- */
  function getStatsSummary() {
    const history = loadHistory();
    const tests = history.length;
    if (tests === 0) return { tests: 0, bestWpm: 0, avgWpm: 0, bestAcc: 0, totalChars: 0, totalErrors: 0 };
    let bestWpm = 0, bestAcc = 0, sumWpm = 0, totalChars = 0, totalErrors = 0;
    for (let i = 0; i < history.length; i++) {
      const h = history[i] || {};
      const wpm = Number(h.wpm) || 0;
      const acc = Number(h.accuracy) || 0;
      if (wpm > bestWpm) bestWpm = wpm;
      if (acc > bestAcc) bestAcc = acc;
      sumWpm += wpm;
      totalChars += Number(h.total) || 0;
      totalErrors += Number(h.errors) || 0;
    }
    return {
      tests: tests, bestWpm: bestWpm,
      avgWpm: Math.round(sumWpm / tests),
      bestAcc: bestAcc, totalChars: totalChars, totalErrors: totalErrors
    };
  }

  function formatDate(ts) {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return '—';
    const pad = function (n) { return n < 10 ? '0' + n : String(n); };
    return pad(d.getDate()) + '.' + pad(d.getMonth()+1) + '.' + d.getFullYear() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function renderStatistics() {
    const s = getStatsSummary();
    const cardsData = [
      { label: 'Best WPM', value: s.bestWpm, suffix: 'wpm' },
      { label: 'Average WPM', value: s.avgWpm, suffix: 'wpm' },
      { label: 'Best Accuracy', value: s.bestAcc, suffix: '%' },
      { label: 'Tests Completed', value: s.tests, suffix: '' },
      { label: 'Total Characters', value: s.totalChars, suffix: '' },
      { label: 'Total Errors', value: s.totalErrors, suffix: '' }
    ];
    statCards.innerHTML = cardsData.map(function (c) {
      return '<div class="card"><div class="card-label">' + c.label + '</div>' +
             '<div class="card-value">' + c.value +
             (c.suffix ? '<small>' + c.suffix + '</small>' : '') + '</div></div>';
    }).join('');

    const history = loadHistory();
    if (history.length === 0) {
      historyBody.innerHTML = '<tr><td colspan="6" class="empty">Hozircha natijalar yo‘q.<br>Birinchi testni boshlang.</td></tr>';
      return;
    }
    historyBody.innerHTML = history.map(function (h) {
      const diff = (h.difficulty || 'easy');
      const dl = diff.charAt(0).toUpperCase() + diff.slice(1);
      return '<tr><td>' + formatDate(h.date) + '</td><td>' + (Number(h.wpm)||0) + '</td><td>' +
             (Number(h.accuracy)||0) + '%</td><td>' + (Number(h.errors)||0) + '</td><td>' +
             (Number(h.duration)||0) + 's</td><td>' + dl + '</td></tr>';
    }).join('');
  }

  function updateHomeBest() {
    const s = getStatsSummary();
    homeBestWpm.innerHTML = '🏆 Best WPM: <b>' + s.bestWpm + '</b>';
  }

  /* ---------- CHIPS UI ---------- */
  function updateChips() {
    $$('.chip', timeChips).forEach(function (b) {
      b.classList.toggle('is-active', Number(b.getAttribute('data-time')) === state.duration);
    });
    $$('.chip', diffChips).forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-diff') === state.difficulty);
    });
  }

  function updateSoundSwitch() {
    soundSwitch.setAttribute('aria-checked', settings.sound ? 'true' : 'false');
  }

  /* ---------- EVENTS ---------- */
  navBtns.forEach(function (btn) {
    btn.addEventListener('click', function () { navigate(btn.getAttribute('data-page')); });
  });

  logoBtn.addEventListener('click', function () { navigate('home'); });

  themeToggle.addEventListener('click', function () {
    applyTheme(settings.theme === 'dark' ? 'light' : 'dark');
  });

  timeChips.addEventListener('click', function (e) {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    state.duration = Number(btn.getAttribute('data-time'));
    settings.duration = state.duration;
    saveSettings();
    updateChips();
  });

  diffChips.addEventListener('click', function (e) {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    state.difficulty = btn.getAttribute('data-diff');
    settings.difficulty = state.difficulty;
    saveSettings();
    updateChips();
  });

  startBtn.addEventListener('click', function () { startTest(true); });

  pauseBtn.addEventListener('click', function () { togglePause(); });
  restartBtn.addEventListener('click', function () { startTest(false); });
  newTextBtn.addEventListener('click', function () { startTest(true); });
  homeBtn2.addEventListener('click', function () { navigate('home'); });

  /* --- MUHIM: typing-card bosilganda inputga focus --- */
  typingCard.addEventListener('click', function (e) {
    /* Agar overlay bosilgan bo'lsa, togglePause */
    if (e.target.closest('#typingOverlay')) {
      if (state.finished || !state.running) return;
      if (state.paused) { togglePause(); }
      else { focusInput(); }
      return;
    }
    if (state.finished || !state.running) return;
    if (state.paused) return;
    focusInput();
  });

  /* Overlay alohida click (ayrim brauzerlarda target overlay bo'lmasligi mumkin) */
  typingOverlay.addEventListener('click', function (e) {
    e.stopPropagation();
    if (state.finished || !state.running) return;
    if (state.paused) togglePause();
    else focusInput();
  });

  /* Touch-friendly: touchend da ham focus */
  typingCard.addEventListener('touchend', function () {
    if (state.finished || state.paused || !state.running) return;
    /* iOS da ba'zida click ishlamaydi — to'g'ridan-to'g'ri focus */
    setTimeout(focusInput, 10);
  }, { passive: true });

  hiddenInput.addEventListener('input', handleInput);

  hiddenInput.addEventListener('focus', function () {
    if (!state.paused) typingCard.classList.remove('is-blurred');
  });

  hiddenInput.addEventListener('blur', function () {
    if (state.finished || state.paused || !state.running) return;
    typingCard.classList.add('is-blurred');
    overlayText.textContent = 'Davom etish uchun bosing';
  });

  /* Clipboard va paste bloklash */
  hiddenInput.addEventListener('paste', function (e) { e.preventDefault(); });
  hiddenInput.addEventListener('drop', function (e) { e.preventDefault(); });
  hiddenInput.addEventListener('cut', function (e) { e.preventDefault(); });
  hiddenInput.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  /* Modal */
  tryAgainBtn.addEventListener('click', function () { startTest(false); });
  newTestBtn.addEventListener('click', function () { startTest(true); });
  backHomeBtn.addEventListener('click', function () { hideResult(); navigate('home'); });

  /* Statistics */
  clearHistoryBtn.addEventListener('click', function () {
    if (loadHistory().length === 0) { showToast('Tarix allaqachon bo‘sh.'); return; }
    if (!window.confirm('Barcha natijalar tarixini o‘chirishni tasdiqlaysizmi?')) return;
    saveHistory([]);
    renderStatistics();
    updateHomeBest();
    showToast('Tarix tozalandi.');
  });

  /* Settings */
  themeChips.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-theme-set]');
    if (!btn) return;
    applyTheme(btn.getAttribute('data-theme-set'));
  });

  soundSwitch.addEventListener('click', function () {
    settings.sound = !settings.sound;
    updateSoundSwitch();
    saveSettings();
    if (settings.sound) { beep(880, 0.12, 0.05, 'sine', 0); showToast('🔊 Sound: ON'); }
    else showToast('🔇 Sound: OFF');
  });

  resetStatsBtn.addEventListener('click', function () {
    if (!window.confirm('Barcha statistika va natijalar o‘chiriladi. Davom etamizmi?')) return;
    saveHistory([]);
    renderStatistics();
    updateHomeBest();
    showToast('Statistika tozalandi.');
  });

  /* Keyboard shortcuts (desktop) */
  document.addEventListener('keydown', function (e) {
    const isPractice = currentPage === 'practice';

    if (e.key === 'Escape') {
      if (isPractice && state.running && !state.finished) {
        e.preventDefault();
        togglePause();
      }
      return;
    }

    if (e.ctrlKey && e.key === 'Enter') {
      if (isPractice || resultModal.classList.contains('is-visible')) {
        e.preventDefault();
        startTest(true);
      }
      return;
    }

    if (e.key === 'Tab' && isPractice) {
      e.preventDefault();
      if (state.running && !state.paused && !state.finished) startTest(true);
    }
  });

  /* Sahifa ko'rinmasa — pauza */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && currentPage === 'practice' && state.running && !state.paused) {
      togglePause();
    }
  });

  /* iOS: klaviatura ochilganda sahifa scroll bo'lmasligi uchun */
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', function () {
      /* Klaviatura ochilganda typing-cardni ko'rinadigan joyga suramiz */
      if (currentPage === 'practice' && document.activeElement === hiddenInput) {
        try {
          typingCard.scrollIntoView({ block: 'center', behavior: 'smooth' });
        } catch (e) { typingCard.scrollIntoView(); }
      }
    });
  }

  /* ---------- INIT ---------- */
  function init() {
    loadSettings();
    state.duration = settings.duration;
    state.difficulty = settings.difficulty;

    applyTheme(settings.theme);
    updateSoundSwitch();
    updateChips();
    updateHomeBest();
    renderStatistics();
    resetStats();
    setPage('home');
  }

  init();

})();