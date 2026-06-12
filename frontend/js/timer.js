let callSeconds = 0;
let callTimerInterval = null;

export function startTimer() {
    callSeconds = 0;

    callTimerInterval = setInterval(() => {
        callSeconds++;
        document.getElementById("status").innerText =
            formatTime(callSeconds);
    }, 1000);
}

export function stopTimer() {
    clearInterval(callTimerInterval);
    callSeconds = 0;
}

export function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;

    return `${m}:${s < 10 ? "0" : ""}${s}`;
}