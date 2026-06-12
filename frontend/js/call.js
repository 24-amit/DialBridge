import {
    socket,
    myNumber,
    currentCallUser,
    callStartTime,
    caller,
    localStream,
    isMuted,
    isSpeakerOn,
    CALL_STATE,
    number,
    setCurrentCallUser,
    setCallState,
    setCallStartTime,
    setIsMuted,
    setIsSpeakerOn
} from "./state.js";

import { cleanupCall } from "./webrtc.js";
import { stopTimer } from "./timer.js";

import {
    showCallScreen,
    resetUI
} from "./ui.js";

import {
    rtdb,
    db
} from "./firebase.js";

import {
    ref,
    get
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

window.makeCall = async () => {
    if (number.length !== 10) {
        alert("Enter valid 10-digit number");
        return;
    }
    const target = "+91" + number;

    try {
        const statusSnap = await get(ref(rtdb, "status/" + target));
        const status = statusSnap.val();

        if (!statusSnap.exists()) {
            alert("User not registered");
            return;
        }

        if (!status?.online) {
            alert("User is offline");
            return;
        }

        setCallStartTime(Date.now());
        setCurrentCallUser(target);

        setCallState("CALLING");

        socket.emit("call-user", {
            to: currentCallUser,
            from: myNumber
        });

        showCallScreen("Calling...");

    } catch (err) {
        console.error(err);
        alert("Error checking user");
    }
};

window.acceptCall = async () => {
    setCallState("IN_CALL");

    setCurrentCallUser(caller);

    socket.emit("call-accepted", {
        to: currentCallUser,
        from: myNumber
    });

    document.getElementById('incoming').style.display = 'none';

    showCallScreen("Connecting...");
    await startWebRTC(false);

    const audio = document.getElementById("remoteAudio");

    try {
        await audio.play();
    } catch (e) {
        console.log(e);
    }
};

window.rejectCall = () => {
    socket.emit("call-rejected", {
        to: caller,
        from: myNumber
    });

    document.getElementById('incoming').style.display = 'none';
    setCallState("IDLE");
};

window.endCall = async () => {
    if (CALL_STATE === "IDLE") return;

    setCallState("IDLE");

    socket.emit("end-call", { to: currentCallUser, from: myNumber });

    const duration = callStartTime ? Math.floor((Date.now() - callStartTime) / 1000) : 0;

    if (currentCallUser) {
        await saveCallLog(myNumber, currentCallUser, duration);
    }

    cleanupCall();
    stopTimer();
    document.getElementById('status').innerText = "Call Ended";

    setTimeout(() => {
        resetUI();
    }, 200);
};

window.toggleMute = () => {
    if (!localStream) return;

    const audioTrack = localStream.getAudioTracks()[0];

    if (!audioTrack) return;

    setIsMuted(!isMuted);
    audioTrack.enabled = !isMuted;
    const muteBtn = document.getElementById("muteBtn");

    if (isMuted) {
        muteBtn.style.background = "#ef4444";
        document.querySelector("#muteBtn svg").style.color = "white";
    } else {
        muteBtn.style.background = "";
        document.querySelector("#muteBtn svg").style.color = "var(--color-text-muted)";
    }

    // SEND MUTE STATE
    socket.emit("mute-state-changed", {
        to: currentCallUser,
        muted: isMuted
    });
};

window.toggleSpeaker = async () => {
    const audio = document.getElementById("remoteAudio");

    if (!audio) return;

    setIsSpeakerOn(!isSpeakerOn);

    try {
        if (typeof audio.setSinkId === "function") {
            if (isSpeakerOn) {
                await audio.setSinkId("default");
            } else {
                await audio.setSinkId("communications");
            }
        }
    } catch (err) {
        console.log("Speaker switch not supported:", err);
    }
    const btn = document.getElementById("speakerBtn");

    if (isSpeakerOn) {
        btn.style.background = "#22c55e";
        btn.querySelector("svg").style.color = "white";
    } else {
        btn.style.background = "";
        btn.querySelector("svg").style.color = "var(--color-text-muted)";
    };
};

export async function saveCallLog(caller, receiver, duration) {
    await addDoc(collection(db, "call_logs"), {
        caller,
        receiver,
        participants: [caller, receiver],
        duration,
        timestamp: serverTimestamp()
    });
}