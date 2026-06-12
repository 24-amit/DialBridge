import {
    CALL_STATE,
    socket,
    peer,
    iceQueue,
    isRemoteSet,
    currentCallUser,
    myNumber,
    callStartTime,
    setCallState,
    setCaller
} from "./state.js";

import {
    cleanupCall,
    handleOffer,
    handleAnswer,
    startWebRTC
} from "./webrtc.js";

import { stopTimer } from "./timer.js";
import { resetUI, showCallScreen } from "./ui.js";
import { saveCallLog } from "./call.js";
import { formatPhone } from "./firebase.js";

export function setupSocketEvents() {

    socket.on("incoming-call", (data) => {

        if (CALL_STATE !== "IDLE") {
            socket.emit("call-rejected", { to: data.from });
            return;
        }
        setCallState("RINGING");

        setCaller(data.from);
        document.getElementById('incomingNum').innerText = "+91 " + formatPhone(data.from);
        document.getElementById('incoming').style.display = 'block';
    });

    socket.on("call-ringing", () => {
        showCallScreen("Ringing...");
    });

    socket.on("call-accepted", async () => {
        setCallState("IN_CALL");
        showCallScreen("Connecting...");
        await startWebRTC(true);
    });

    socket.on("call-rejected", () => {
        document.getElementById('status').innerText = "Call Rejected";
        setTimeout(resetUI, 500);
    });

    socket.on("offer", async (offer) => {
        await handleOffer(offer);
    });

    socket.on("answer", async (answer) => {
        await handleAnswer(answer);
    });

    socket.on("remote-mute-state", (data) => {
        const indicator = document.getElementById("remoteMuteIndicator");

        if (!indicator) return;

        if (data.muted) {
            indicator.innerText = "Microphone muted";
            indicator.style.display = "block";
        } else {
            indicator.style.display = "none";
        }
    });

    socket.on("ice-candidate", async (candidate) => {
        const ice = new RTCIceCandidate(candidate);

        if (isRemoteSet) {
            await peer.addIceCandidate(ice);
        } else {
            iceQueue.push(ice);
        }
    });

    socket.on("call-ended", async () => {
        setCallState("IDLE");

        cleanupCall();
        stopTimer();
        document.getElementById('status').innerText = "Call Ended";

        const duration = callStartTime ? Math.floor((Date.now() - callStartTime) / 1000) : 0;

        if (currentCallUser) {
            await saveCallLog(currentCallUser, myNumber, duration);
        }

        setTimeout(() => {
            resetUI();
        }, 200);
    });

    socket.on("user-offline", () => {
        document.getElementById('status').innerText = "User is offline";
        setTimeout(resetUI, 2000);
    });

    socket.on("reconnect", () => {
        console.log("Reconnected");

        socket.emit("register", myNumber);

        if (CALL_STATE !== "IDLE") {
            cleanupCall();
            stopTimer();
            resetUI();
            setCallState("IDLE");
        }
    });
}