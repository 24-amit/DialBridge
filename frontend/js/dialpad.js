import { number, setNumber } from "./state.js";

const deleteBtn = document.getElementById("deleteBtn");
let holdTimer = null;
let isHolding = false;

export function updateDisplay() {
    const text = document.getElementById('numberText');
    const cursor = document.getElementById('cursor');
    const bar = document.getElementById('number');
    if (number) {
        text.innerText = "+91 " + number;
        cursor.style.display = 'inline-block';
        bar.classList.add('has-number');
    } else {
        text.innerText = "";
        cursor.style.display = 'none';
        bar.classList.remove('has-number');
    }
}

window.press = (n) => {
    if (number.length >= 10) return;

    setNumber(number + n);
    updateDisplay();
};

window.removeNumber = () => {
    if (!number) return;
    setNumber(number.slice(0, -1));
    updateDisplay();
};

let backspaceStart = 0;
export function enableDialpadKeyboard() {
    document.body.setAttribute("tabindex", "0");

    setTimeout(() => {
        focusDialpad();
    }, 300);

    document.addEventListener("click", () => {
        focusDialpad();
    });

    document.addEventListener("keydown", (e) => {
        if (e.repeat && e.key !== "Backspace") return;

        if (/^[0-9]$/.test(e.key)) {
            press(e.key);
            return;
        }

        if (e.key === "*") {
            press("*");
            return;
        }

        if (e.key === "#") {
            press("#");
            return;
        }

        if (e.key === "Enter") {
            e.preventDefault();

            if (number.length === 10) {
                makeCall();
            } else {
                alert("Enter valid 10-digit number");
            }
            return;
        }

        if (e.key === "Backspace") {
            e.preventDefault();

            if (e.repeat) return;

            backspaceStart = Date.now();
            removeNumber();
        }
    });

    document.addEventListener("keyup", (e) => {
        if (e.key !== "Backspace") return;

        const holdDuration = Date.now() - backspaceStart;

        if (holdDuration >= 500) {
            setNumber("");
            updateDisplay();
        }
    });
}

export function focusDialpad() {
    document.body.focus();
}

deleteBtn.addEventListener("click", () => {
    if (!isHolding) {
        removeNumber();
    }
});

// START HOLD
deleteBtn.addEventListener("pointerdown", (e) => {
    e.preventDefault();

    isHolding = false;

    holdTimer = setTimeout(() => {
        setNumber("");
        updateDisplay();
        isHolding = true;
    }, 500);
});

// END HOLD
deleteBtn.addEventListener("pointerup", () => {
    clearTimeout(holdTimer);
});