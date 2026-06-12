import { db, formatPhone } from "./firebase.js";

import {
    collection,
    query,
    where,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { number, setNumber } from "./state.js";

import { switchTab } from "./ui.js";

import { updateDisplay } from "./dialpad.js";

export async function loadCallHistory(userNumber) {
    const q = query(
        collection(db, "call_logs"),
        where("participants", "array-contains", userNumber)
    );
    onSnapshot(q, (snap) => {
        const historyHTML = [];

        snap.forEach(doc => {
            const data = doc.data();

            const isOutgoing = data.caller === userNumber;

            historyHTML.push({
                num: isOutgoing ? data.receiver : data.caller,
                dur: data.duration,
                type: isOutgoing ? "out" : "in",
                ts: data.timestamp?.toDate()
            });
        });
        historyHTML.sort((a, b) => b.ts - a.ts);

        const list = document.getElementById("historyList");

        if (!historyHTML.length) {
            list.innerHTML = `
<div class="history-empty">
    <p>No recent calls</p>
</div>`;
            return;
        }

        list.innerHTML = historyHTML.map(item => {
            const formatted = item.ts
                ? new Date(item.ts).toLocaleString()
                : "Just now";

            return `
    <div class="history-item" onclick="dialFromHistory('${item.num}')">
        <div class="history-icon ${item.type}">
            ${item.type === "out" ? "↗" : "↙"}
        </div>
        <div class="history-info">
            <div class="history-num">+91 ${formatPhone(item.num)}</div>
            <div class="history-dur">
                ${item.dur}s • ${formatted}
            </div>
        </div>
    </div>
    `;
        }).join("");
    });
}

export function dialFromHistory(num) {
    setNumber(num.replace("+91", ""));
    updateDisplay();

    switchTab("dialpad");

    document.querySelector("input[value='dialpad']").checked = true;
};

window.dialFromHistory = dialFromHistory;