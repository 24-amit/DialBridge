import { formatPhone } from "./firebase.js";

import {
    currentCallUser,
    caller,
    number,
    setNumber,
    setIsSpeakerOn
} from "./state.js";

import { updateDisplay } from "./dialpad.js";

export function generateAvatar(number) {
    const colors = [
        ["#7c3aed", "#06b6d4"],
        ["#ff6b6b", "#f59e0b"],
        ["#06b6d4", "#3b82f6"],
        ["#10b981", "#14b8a6"],
        ["#ec4899", "#8b5cf6"],
        ["#f97316", "#ef4444"]
    ];

    let hash = 0;

    for (let i = 0; i < number.length; i++) {
        hash += number.charCodeAt(i);
    }

    const theme = colors[hash % colors.length];

    const avatar = document.getElementById("callAvatar");

    if (avatar) {
        avatar.style.background =
            `linear-gradient(135deg, ${theme[0]}, ${theme[1]})`;
    }

    document.getElementById("avatarLetter").innerText = "📞";
}

export function switchTab(tab) {
    const history = document.getElementById("historySection");
    const dialpad = document.getElementById("dialpadSection");

    if (!history || !dialpad) return;

    if (tab === "history") {
        history.style.display = "block";
        dialpad.style.display = "none";
    } else {
        history.style.display = "none";
        dialpad.style.display = "flex";
    }
}

window.switchTab = switchTab;

export function showDialer() {
    document.getElementById("dialer").style.display = "flex";
    document.getElementById("callScreen").style.display = "none";
}

export function showCallScreen(status) {
    document.getElementById("dialer").style.display = "none";
    document.getElementById("callScreen").style.display = "flex";

    document.getElementById("status").innerText = status;

    const user = currentCallUser || caller || number;

    if (user) {
        generateAvatar(user);
        document.getElementById("callUser").innerText =
            "+91 " + formatPhone(user);
    }

    document.getElementById("remoteMuteIndicator").style.display = "none";
}

export function resetUI() {
    showDialer();

    document.getElementById("incoming").style.display = "none";

    document.getElementById("status").innerText = "Ringing...";

    const remoteAudio =
        document.getElementById("remoteAudio");

    if (remoteAudio) {
        remoteAudio.pause();
        remoteAudio.srcObject = null;
    }

    setIsSpeakerOn(false);

    const speakerBtn =
        document.getElementById("speakerBtn");

    if (speakerBtn) {
        speakerBtn.style.background = "";
        speakerBtn.querySelector("svg").style.color =
            "var(--color-text-muted)";
    }

    setNumber("");
    updateDisplay();
}