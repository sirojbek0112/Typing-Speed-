"use strict";

/* =========================================================
   TYPING SPEED
   Vanilla JavaScript
   ========================================================= */


/* =========================================================
   STORAGE
   ========================================================= */

const STORAGE_KEYS = {
    statistics: "typingSpeed_statistics",
    theme: "typingSpeed_theme",
    sound: "typingSpeed_sound"
};


/* =========================================================
   TEXT DATABASE
   ========================================================= */

const TEXTS = {

    easy: [
        "The sun is warm and the sky is blue.",
        "I like to write clean code every day.",
        "Practice makes typing faster and easier.",
        "Small steps can lead to great results.",
        "Learning new skills takes time and focus.",
        "Good code should be simple and clear.",
        "A fast keyboard can make work more comfortable.",
        "Every programmer should practice regularly.",
        "Keep learning and build something useful.",
        "The best way to improve is to keep practicing."
    ],

    medium: [
        "Programming is a creative skill that combines logic, patience, and problem solving.",
        "A good developer writes code that is easy to understand, test, and maintain.",
        "The internet connects computers around the world and allows information to move quickly.",
        "JavaScript makes modern websites interactive and gives users a better experience.",
        "Learning to type faster can help programmers spend more time thinking about solutions.",
        "Every software project starts with an idea and becomes useful through careful development.",
        "Clean code is not only about making a program work, but also about making it understandable.",
        "Developers solve problems every day by breaking large tasks into smaller and simpler steps."
    ],

    hard: [
        "Modern software development requires patience, precision, creativity, and the ability to solve unexpected problems.",
        "A professional programmer should understand how algorithms, data structures, networks, and operating systems work together.",
        "Writing reliable applications requires careful testing, meaningful variable names, reusable functions, and thoughtful architecture.",
        "The difference between a beginner and an experienced developer is often the ability to investigate problems instead of guessing.",
        "When a website becomes more complex, developers must think about performance, accessibility, security, maintainability, and user experience.",
        "Great programmers do not simply write more code; they find simpler solutions, remove unnecessary complexity, and continuously improve their work.",
        "Modern browsers can execute powerful JavaScript applications directly on the client, making interactive experiences possible without traditional desktop software."
    ]

};


/* =========================================================
   STATE
   ========================================================= */

const state = {

    selectedTime: 30,
    selectedDifficulty: "easy",

    text: "",
    characters: [],

    started: false,
    finished: false,
    paused: false,

    startTime: null,
    endTime: null,

    remainingTime: 30,
    elapsedSeconds: 0,

    timerInterval: null,
    animationFrame: null,

    typedValue: "",
    correctCharacters: 0,
    errors: 0,

    soundEnabled: true,

    statistics: {
        bestWpm: 0,
        bestAccuracy: 0,
        totalTests: 0,
        totalWpm: 0,
        totalCharacters: 0,
        totalErrors: 0,
        history: []
    }

};


/* =========================================================
   DOM
   ========================================================= */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);


/* Navigation */
const navLinks = $$(".nav-link");
const sections = $$(".page-section");
const mobileMenuBtn = $("#mobileMenuBtn");
const nav = $(".nav");


/* Home */
const homeBestWpm = $("#homeBestWpm");
const homeTests = $("#homeTests");
const startBtn = $("#startBtn");


/* Setup */
const timeOptions = $$("#timeOptions .option-btn");
const difficultyOptions = $$(".difficulty-btn");


/* Live stats */
const liveWpm = $("#liveWpm");
const liveAccuracy = $("#liveAccuracy");
const liveErrors = $("#liveErrors");
const liveTime = $("#liveTime");

const testDifficulty = $("#testDifficulty");
const testDuration = $("#testDuration");

const progressBar = $("#progressBar");
const progressText = $("#progressText");

const typingText = $("#typingText");
const typingInput = $("#typingInput");

const inputStatus = $("#inputStatus");

const correctChars = $("#correctChars");
const typedChars = $("#typedChars");

const pauseBtn = $("#pauseBtn");
const restartBtn = $("#restartBtn");

const pauseOverlay = $("#pauseOverlay");
const resumeBtn = $("#resumeBtn");


/* Statistics */
const statsBestWpm = $("#statsBestWpm");
const statsAverageWpm = $("#statsAverageWpm");
const statsBestAccuracy = $("#statsBestAccuracy");
const statsTests = $("#statsTests");
const statsCharacters = $("#statsCharacters");
const statsErrors = $("#statsErrors");

const historyBody = $("#historyBody");
const emptyHistory = $("#emptyHistory");

const clearHistoryBtn = $("#clearHistoryBtn");


/* Settings */
const themeButtons = $$(".theme-btn");
const soundToggle = $("#soundToggle");
const resetStatsBtn = $("#resetStatsBtn");


/* Modal */
const resultModal = $("#resultModal");
const modalCloseBtn = $("#modalCloseBtn");

const resultWpm = $("#resultWpm");
const resultAccuracy = $("#resultAccuracy");
const resultErrors = $("#resultErrors");
const resultCorrect = $("#resultCorrect");
const resultTotal = $("#resultTotal");
const resultTime = $("#resultTime");
const resultDifficulty = $("#resultDifficulty");

const newRecord = $("#newRecord");

const tryAgainBtn = $("#tryAgainBtn");
const newTestBtn = $("#newTestBtn");
const backHomeBtn = $("#backHomeBtn");


/* Toast */
const toast = $("#toast");
const toastMessage = $("#toastMessage");
const toastIcon = $("#toastIcon");

let toastTimeout = null;


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", init);

function init() {

    loadStatistics();
    loadTheme();
    loadSoundSetting();

    updateHomeStats();
    updateStatisticsUI();

    setupNavigation();
    setupTestOptions();
    setupTestControls();
    setupSettings();

    prepareTest();

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    navLinks.forEach((link) => {

        link.addEventListener("click", () => {

            const sectionId = link.dataset.section;

            showSection(sectionId);

            nav.classList.remove("mobile-open");

        });

    });


    mobileMenuBtn.addEventListener("click", () => {

        nav.classList.toggle("mobile-open");

    });


    document.querySelector(".logo").addEventListener("click", (event) => {

        event.preventDefault();

        showSection("home");

    });

}


function showSection(sectionId) {

    sections.forEach((section) => {

        section.classList.toggle(
            "active-section",
            section.id === sectionId
        );

    });


    navLinks.forEach((link) => {

        link.classList.toggle(
            "active",
            link.dataset.section === sectionId
        );

    });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    if (sectionId === "statistics") {
        updateStatisticsUI();
    }

}


/* =========================================================
   TEST OPTIONS
   ========================================================= */

function setupTestOptions() {

    timeOptions.forEach((button) => {

        button.addEventListener("click", () => {

            if (state.started) {
                showToast(
                    "Finish or restart the current test first.",
                    "!"
                );
                return;
            }

            timeOptions.forEach((item) => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            state.selectedTime = Number(button.dataset.time);

            updateLiveTime();

        });

    });


    difficultyOptions.forEach((button) => {

        button.addEventListener("click", () => {

            if (state.started) {
                showToast(
                    "Finish or restart the current test first.",
                    "!"
                );
                return;
            }

            difficultyOptions.forEach((item) => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            state.selectedDifficulty =
                button.dataset.difficulty;

        });

    });

}


/* =========================================================
   PREPARE TEST
   ========================================================= */

function prepareTest() {

    clearTimer();

    state.text = getRandomText(state.selectedDifficulty);

    state.characters = Array.from(state.text);

    state.started = false;
    state.finished = false;
    state.paused = false;

    state.startTime = null;
    state.endTime = null;

    state.remainingTime = state.selectedTime;
    state.elapsedSeconds = 0;

    state.typedValue = "";
    state.correctCharacters = 0;
    state.errors = 0;

    renderTypingText();

    typingInput.value = "";
    typingInput.disabled = true;

    pauseOverlay.classList.remove("show");

    pauseBtn.textContent = "❚❚";

    inputStatus.textContent =
        "Click here and start typing";

    updateLiveStats();
    updateProgress();

    testDifficulty.textContent =
        state.selectedDifficulty.toUpperCase();

    testDuration.textContent =
        `${state.selectedTime} seconds`;

}


function getRandomText(difficulty) {

    const list = TEXTS[difficulty];

    let selected =
        list[Math.floor(Math.random() * list.length)];

    return selected;

}


/* =========================================================
   START TEST
   ========================================================= */

function startTest() {

    if (state.started && !state.finished) {
        return;
    }

    closeResultModal();

    showSection("practice");

    state.text = getRandomText(state.selectedDifficulty);
    state.characters = Array.from(state.text);

    state.started = true;
    state.finished = false;
    state.paused = false;

    state.startTime = performance.now();

    state.endTime = null;

    state.remainingTime = state.selectedTime;
    state.elapsedSeconds = 0;

    state.typedValue = "";
    state.correctCharacters = 0;
    state.errors = 0;

    renderTypingText();

    typingInput.disabled = false;
    typingInput.value = "";

    inputStatus.textContent =
        "Typing...";

    typingInput.focus();

    pauseOverlay.classList.remove("show");

    pauseBtn.textContent = "❚❚";

    updateLiveStats();
    updateProgress();

    clearTimer();

    state.timerInterval = setInterval(() => {

        if (!state.started || state.paused) {
            return;
        }

        const elapsed =
            (performance.now() - state.startTime) / 1000;

        state.elapsedSeconds = Math.min(
            elapsed,
            state.selectedTime
        );

        state.remainingTime = Math.max(
            0,
            state.selectedTime - state.elapsedSeconds
        );

        updateLiveStats();
        updateProgress();

        if (state.remainingTime <= 0) {
            finishTest("time");
        }

    }, 100);

}


/* =========================================================
   TYPING INPUT
   ========================================================= */

typingInput.addEventListener("input", handleTyping);

function handleTyping() {

    if (!state.started || state.finished || state.paused) {
        return;
    }

    const value = typingInput.value;

    /*
       Prevent the user from typing beyond the target text.
    */
    if (value.length > state.text.length) {

        typingInput.value =
            value.substring(0, state.text.length);

    }

    state.typedValue = typingInput.value;

    calculateCurrentStats();

    renderTypingText();

    updateLiveStats();
    updateProgress();

    playTypingSound();

    /*
       Finish immediately when the whole text is correct.
    */
    if (
        state.typedValue.length === state.text.length
    ) {

        finishTest("completed");

    }

}


/* =========================================================
   CALCULATE LIVE STATS
   ========================================================= */

function calculateCurrentStats() {

    const typed = state.typedValue;

    let correct = 0;
    let errors = 0;

    for (let i = 0; i < typed.length; i++) {

        if (typed[i] === state.text[i]) {
            correct++;
        } else {
            errors++;
        }

    }

    state.correctCharacters = correct;
    state.errors = errors;

}


/* =========================================================
   RENDER CHARACTER HIGHLIGHTING
   ========================================================= */

function renderTypingText() {

    const fragment =
        document.createDocumentFragment();

    const typed = state.typedValue;

    state.characters.forEach((character, index) => {

        const span =
            document.createElement("span");

        span.className = "char";

        span.textContent =
            character === " " ? "\u00A0" : character;

        if (index < typed.length) {

            if (typed[index] === character) {
                span.classList.add("correct");
            } else {
                span.classList.add("incorrect");
            }

        } else if (index === typed.length) {

            span.classList.add("current");

        }

        fragment.appendChild(span);

    });

    typingText.replaceChildren(fragment);

}


/* =========================================================
   REAL WPM
   ========================================================= */

function calculateWPM() {

    if (!state.startTime) {
        return 0;
    }

    const elapsedMinutes =
        state.elapsedSeconds / 60;

    if (elapsedMinutes <= 0) {
        return 0;
    }

    /*
       WPM = typed characters / 5 / minutes
    */
    const wpm =
        (state.typedValue.length / 5) /
        elapsedMinutes;

    return Math.max(
        0,
        Math.round(wpm)
    );

}


/* =========================================================
   ACCURACY
   ========================================================= */

function calculateAccuracy() {

    const totalTyped =
        state.typedValue.length;

    if (totalTyped === 0) {
        return 100;
    }

    return Math.max(
        0,
        Math.min(
            100,
            Math.round(
                (
                    state.correctCharacters /
                    totalTyped
                ) * 100
            )
        )
    );

}


/* =========================================================
   LIVE STATS UI
   ========================================================= */

function updateLiveStats() {

    const wpm =
        calculateWPM();

    const accuracy =
        calculateAccuracy();

    liveWpm.textContent =
        wpm;

    liveAccuracy.textContent =
        `${accuracy}%`;

    liveErrors.textContent =
        state.errors;

    liveTime.textContent =
        `${Math.ceil(state.remainingTime)}s`;

    correctChars.textContent =
        state.correctCharacters;

    typedChars.textContent =
        state.typedValue.length;

}


/* =========================================================
   PROGRESS
   ========================================================= */

function updateProgress() {

    if (!state.text.length) {
        return;
    }

    const progress =
        Math.min(
            100,
            Math.round(
                (
                    state.typedValue.length /
                    state.text.length
                ) * 100
            )
        );

    progressBar.style.width =
        `${progress}%`;

    progressText.textContent =
        `${progress}%`;

}


/* =========================================================
   TIMER
   ========================================================= */

function clearTimer() {

    if (state.timerInterval) {

        clearInterval(
            state.timerInterval
        );

        state.timerInterval = null;

    }

}


function updateLiveTime() {

    if (!state.started) {

        liveTime.textContent =
            `${state.selectedTime}s`;

    }

}


/* =========================================================
   PAUSE / RESUME
   ========================================================= */

function togglePause() {

    if (!state.started || state.finished) {
        return;
    }

    if (state.paused) {
        resumeTest();
    } else {
        pauseTest();
    }

}


function pauseTest() {

    if (!state.started || state.finished) {
        return;
    }

    state.paused = true;

    /*
       Store elapsed time before pausing.
    */
    const now =
        performance.now();

    state.elapsedSeconds =
        Math.min(
            state.selectedTime,
            (now - state.startTime) / 1000
        );

    state.remainingTime =
        Math.max(
            0,
            state.selectedTime -
            state.elapsedSeconds
        );

    pauseOverlay.classList.add("show");

    pauseBtn.textContent = "▶";

    inputStatus.textContent =
        "Test paused";

    typingInput.blur();

    updateLiveStats();

}


function resumeTest() {

    if (!state.started || state.finished) {
        return;
    }

    /*
       Rebuild startTime so paused time is not counted.
    */
    state.startTime =
        performance.now() -
        (state.elapsedSeconds * 1000);

    state.paused = false;

    pauseOverlay.classList.remove("show");

    pauseBtn.textContent = "❚❚";

    inputStatus.textContent =
        "Typing...";

    typingInput.focus();

}


/* =========================================================
   FINISH TEST
   ========================================================= */

function finishTest(reason = "completed") {

    if (state.finished) {
        return;
    }

    state.finished = true;
    state.started = false;

    clearTimer();

    /*
       If completed before time limit, calculate actual time.
       If timer expired, use selected duration.
    */
    if (reason === "time") {

        state.elapsedSeconds =
            state.selectedTime;

    } else {

        state.elapsedSeconds =
            Math.max(
                0.001,
                (performance.now() -
                    state.startTime) / 1000
            );

    }

    state.remainingTime =
        Math.max(
            0,
            state.selectedTime -
            state.elapsedSeconds
        );

    calculateCurrentStats();

    const result =
        buildResult();

    const isNewRecord =
        result.wpm >
        state.statistics.bestWpm;

    saveTestResult(
        result,
        isNewRecord
    );

    typingInput.disabled = true;

    inputStatus.textContent =
        reason === "time"
            ? "Time is up!"
            : "Test completed!";

    pauseOverlay.classList.remove("show");

    pauseBtn.textContent = "❚❚";

    updateLiveStats();
    updateProgress();

    showResult(result, isNewRecord);

}


/* =========================================================
   RESULT OBJECT
   ========================================================= */

function buildResult() {

    const wpm =
        calculateWPM();

    const accuracy =
        calculateAccuracy();

    return {

        date: new Date().toISOString(),

        wpm,
        accuracy,

        errors:
            state.errors,

        correctCharacters:
            state.correctCharacters,

        totalCharacters:
            state.typedValue.length,

        elapsedSeconds:
            Math.round(
                state.elapsedSeconds
            ),

        difficulty:
            state.selectedDifficulty,

        duration:
            state.selectedTime

    };

}


/* =========================================================
   SAVE STATISTICS
   ========================================================= */

function saveTestResult(
    result,
    isNewRecord
) {

    const stats =
        state.statistics;

    stats.totalTests++;

    stats.totalWpm += result.wpm;

    stats.totalCharacters +=
        result.totalCharacters;

    stats.totalErrors +=
        result.errors;

    stats.bestWpm =
        Math.max(
            stats.bestWpm,
            result.wpm
        );

    stats.bestAccuracy =
        Math.max(
            stats.bestAccuracy,
            result.accuracy
        );

    stats.history.unshift(result);

    /*
       Keep last 50 tests.
    */
    stats.history =
        stats.history.slice(0, 50);

    saveStatistics();

    updateHomeStats();
    updateStatisticsUI();

}


/* =========================================================
   LOCAL STORAGE — STATISTICS
   ========================================================= */

function loadStatistics() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEYS.statistics
            );

        if (!saved) {
            return;
        }

        const parsed =
            JSON.parse(saved);

        state.statistics = {
            ...state.statistics,
            ...parsed,

            history:
                Array.isArray(parsed.history)
                    ? parsed.history
                    : []

        };

    } catch (error) {

        console.warn(
            "Could not load statistics:",
            error
        );

    }

}


function saveStatistics() {

    try {

        localStorage.setItem(
            STORAGE_KEYS.statistics,
            JSON.stringify(
                state.statistics
            )
        );

    } catch (error) {

        console.warn(
            "Could not save statistics:",
            error
        );

    }

}


/* =========================================================
   HOME STATS
   ========================================================= */

function updateHomeStats() {

    homeBestWpm.textContent =
        state.statistics.bestWpm;

    homeTests.textContent =
        state.statistics.totalTests;

}


/* =========================================================
   STATISTICS UI
   ========================================================= */

function updateStatisticsUI() {

    const stats =
        state.statistics;

    const average =
        stats.totalTests > 0
            ? Math.round(
                stats.totalWpm /
                stats.totalTests
            )
            : 0;

    statsBestWpm.textContent =
        stats.bestWpm;

    statsAverageWpm.textContent =
        average;

    statsBestAccuracy.textContent =
        `${stats.bestAccuracy}%`;

    statsTests.textContent =
        stats.totalTests;

    statsCharacters.textContent =
        stats.totalCharacters;

    statsErrors.textContent =
        stats.totalErrors;

    renderHistory();

}


/* =========================================================
   HISTORY
   ========================================================= */

function renderHistory() {

    historyBody.replaceChildren();

    const history =
        state.statistics.history;

    if (!history.length) {

        emptyHistory.style.display =
            "block";

        return;

    }

    emptyHistory.style.display =
        "none";

    history.forEach((item) => {

        const row =
            document.createElement("tr");

        const dateCell =
            document.createElement("td");

        const wpmCell =
            document.createElement("td");

        const accuracyCell =
            document.createElement("td");

        const errorsCell =
            document.createElement("td");

        dateCell.textContent =
            formatDate(item.date);

        wpmCell.textContent =
            `${item.wpm} WPM`;

        accuracyCell.textContent =
            `${item.accuracy}%`;

        errorsCell.textContent =
            item.errors;

        row.append(
            dateCell,
            wpmCell,
            accuracyCell,
            errorsCell
        );

        historyBody.appendChild(row);

    });

}


function formatDate(dateString) {

    const date =
        new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "Unknown";
    }

    return date.toLocaleString(
        undefined,
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   CLEAR HISTORY
   ========================================================= */

clearHistoryBtn.addEventListener(
    "click",
    clearHistory
);


function clearHistory() {

    if (
        !state.statistics.history.length
    ) {

        showToast(
            "There is no history to clear.",
            "!"
        );

        return;

    }

    const confirmed =
        window.confirm(
            "Clear all test history?"
        );

    if (!confirmed) {
        return;
    }

    state.statistics.history = [];

    saveStatistics();

    updateStatisticsUI();

    showToast(
        "Test history cleared.",
        "✓"
    );

}


/* =========================================================
   RESET ALL DATA
   ========================================================= */

resetStatsBtn.addEventListener(
    "click",
    resetAllStatistics
);


function resetAllStatistics() {

    const confirmed =
        window.confirm(
            "This will permanently delete all typing statistics. Continue?"
        );

    if (!confirmed) {
        return;
    }

    state.statistics = {

        bestWpm: 0,
        bestAccuracy: 0,
        totalTests: 0,
        totalWpm: 0,
        totalCharacters: 0,
        totalErrors: 0,
        history: []

    };

    saveStatistics();

    updateHomeStats();
    updateStatisticsUI();

    showToast(
        "All statistics have been reset.",
        "✓"
    );

}


/* =========================================================
   RESULT MODAL
   ========================================================= */

function showResult(
    result,
    isNewRecord
) {

    resultWpm.textContent =
        result.wpm;

    resultAccuracy.textContent =
        `${result.accuracy}%`;

    resultErrors.textContent =
        result.errors;

    resultCorrect.textContent =
        result.correctCharacters;

    resultTotal.textContent =
        result.totalCharacters;

    resultTime.textContent =
        `${result.elapsedSeconds} sec`;

    resultDifficulty.textContent =
        capitalize(
            result.difficulty
        );

    newRecord.classList.toggle(
        "show",
        isNewRecord
    );

    resultModal.classList.add("show");

    resultModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-open"
    );

}


function closeResultModal() {

    resultModal.classList.remove(
        "show"
    );

    resultModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "modal-open"
    );

}


/* =========================================================
   RESULT BUTTONS
   ========================================================= */

tryAgainBtn.addEventListener(
    "click",
    () => {

        closeResultModal();

        prepareTest();

        startTest();

    }
);


newTestBtn.addEventListener(
    "click",
    () => {

        closeResultModal();

        prepareTest();

        showSection("home");

    }
);


backHomeBtn.addEventListener(
    "click",
    () => {

        closeResultModal();

        prepareTest();

        showSection("home");

    }
);


modalCloseBtn.addEventListener(
    "click",
    () => {

        closeResultModal();

        prepareTest();

        showSection("home");

    }
);


resultModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target.classList.contains(
                "modal-backdrop"
            )
        ) {

            closeResultModal();

            prepareTest();

            showSection("home");

        }

    }
);


/* =========================================================
   TEST CONTROLS
   ========================================================= */

function setupTestControls() {

    startBtn.addEventListener(
        "click",
        startTest
    );

    pauseBtn.addEventListener(
        "click",
        togglePause
    );

    resumeBtn.addEventListener(
        "click",
        resumeTest
    );

    restartBtn.addEventListener(
        "click",
        () => {

            const shouldRestart =
                !state.started ||
                window.confirm(
                    "Restart the current test?"
                );

            if (!shouldRestart) {
                return;
            }

            prepareTest();

            startTest();

        }
    );

}


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        /*
           Escape:
           Stop current test and return home.
        */
        if (event.key === "Escape") {

            if (
                resultModal.classList.contains(
                    "show"
                )
            ) {

                closeResultModal();

                prepareTest();

                showSection("home");

                return;

            }

            if (state.started) {

                const confirmed =
                    window.confirm(
                        "Stop the current test?"
                    );

                if (confirmed) {

                    prepareTest();

                    showSection("home");

                }

            }

            return;

        }


        /*
           Space:
           Pause/resume only when typing input
           is not being actively edited.
        */
        if (
            event.code === "Space" &&
            state.started &&
            document.activeElement !== typingInput
        ) {

            event.preventDefault();

            togglePause();

        }


        /*
           Tab:
           Focus typing input while test is running.
        */
        if (
            event.key === "Tab" &&
            state.started &&
            !state.paused
        ) {

            event.preventDefault();

            typingInput.focus();

        }

    }
);


/* =========================================================
   SETTINGS
   ========================================================= */

function setupSettings() {

    themeButtons.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                setTheme(
                    button.dataset.theme
                );

            }
        );

    });


    soundToggle.addEventListener(
        "change",
        () => {

            state.soundEnabled =
                soundToggle.checked;

            saveSoundSetting();

            showToast(
                state.soundEnabled
                    ? "Typing sound enabled."
                    : "Typing sound disabled.",
                state.soundEnabled
                    ? "🔊"
                    : "🔇"
            );

        }
    );

}


/* =========================================================
   THEME
   ========================================================= */

function loadTheme() {

    let theme = "dark";

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEYS.theme
            );

        if (
            saved === "dark" ||
            saved === "light"
        ) {
            theme = saved;
        }

    } catch (error) {
        console.warn(error);
    }

    setTheme(
        theme,
        false
    );

}


function setTheme(
    theme,
    showNotification = true
) {

    document.documentElement.dataset.theme =
        theme;

    themeButtons.forEach((button) => {

        button.classList.toggle(
            "active",
            button.dataset.theme === theme
        );

    });

    try {

        localStorage.setItem(
            STORAGE_KEYS.theme,
            theme
        );

    } catch (error) {

        console.warn(
            "Could not save theme:",
            error
        );

    }

    if (showNotification) {

        showToast(
            theme === "dark"
                ? "Dark mode enabled."
                : "Light mode enabled.",
            theme === "dark"
                ? "🌙"
                : "☀️"
        );

    }

}


/* =========================================================
   SOUND
   ========================================================= */

function loadSoundSetting() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEYS.sound
            );

        if (saved === null) {

            state.soundEnabled = true;

        } else {

            state.soundEnabled =
                saved === "true";

        }

    } catch (error) {

        state.soundEnabled = true;

    }

    soundToggle.checked =
        state.soundEnabled;

}


function saveSoundSetting() {

    try {

        localStorage.setItem(
            STORAGE_KEYS.sound,
            String(
                state.soundEnabled
            )
        );

    } catch (error) {

        console.warn(
            "Could not save sound setting:",
            error
        );

    }

}


/* =========================================================
   TYPING SOUND
   ========================================================= */

/*
   Web Audio API is used directly from the browser.
   No external audio file is needed.
*/

let audioContext = null;

function playTypingSound() {

    if (!state.soundEnabled) {
        return;
    }

    try {

        if (!audioContext) {

            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContext) {
                return;
            }

            audioContext =
                new AudioContext();

        }

        if (
            audioContext.state === "suspended"
        ) {

            audioContext.resume();

        }

        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();

        oscillator.type = "sine";

        oscillator.frequency.setValueAtTime(
            520 + Math.random() * 100,
            audioContext.currentTime
        );

        gain.gain.setValueAtTime(
            0.025,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + 0.035
        );

        oscillator.connect(gain);
        gain.connect(
            audioContext.destination
        );

        oscillator.start();

        oscillator.stop(
            audioContext.currentTime + 0.04
        );

    } catch (error) {

        /*
           Sound is optional.
           The typing game continues normally
           if audio is unavailable.
        */

    }

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
    message,
    icon = "✓"
) {

    clearTimeout(
        toastTimeout
    );

    toastMessage.textContent =
        message;

    toastIcon.textContent =
        icon;

    toast.classList.add("show");

    toastTimeout =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2600);

}


/* =========================================================
   HELPERS
   ========================================================= */

function capitalize(value) {

    if (!value) {
        return "";
    }

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );

}


/* =========================================================
   BEFORE UNLOAD
   ========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        clearTimer();

    }
);