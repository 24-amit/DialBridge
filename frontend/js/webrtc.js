import { ICE_SERVERS } from "./config.js";
import {
    setPeer,
    setLocalStream,
    setCurrentCallUser,
    setCaller,
    setCallState,
    setCallStartTime,
    setIsRemoteSet,
    setIceQueue,
    setIsMuted,

    peer,
    localStream,
    currentCallUser,
    caller,
    CALL_STATE,
    iceQueue,
    isRemoteSet,
    socket
} from "./state.js";

import {
    startTimer,
    stopTimer
} from "./timer.js";

import {
    resetUI
} from "./ui.js";

export async function startWebRTC(isCaller) {
    if (peer) cleanupCall();

    try {
        setPeer(
            new RTCPeerConnection({
                iceServers: ICE_SERVERS
            })
        );

        try {
            setLocalStream(
                await navigator.mediaDevices.getUserMedia({
                    audio: true
                })
            );

            if (!localStream) return;
        } catch (err) {
            alert("Microphone permission denied");
            return;
        }

        localStream.getTracks().forEach(track => {
            peer.addTrack(track, localStream);
        });

        peer.ontrack = async (event) => {
            const audio = document.getElementById("remoteAudio");
            audio.srcObject = event.streams[0];
            // audio.play().catch(() => { });
            audio.volume = 1;

            try {
                await audio.play();
            } catch (err) {
                console.log(err);
            }
        };

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("ice-candidate", {
                    to: currentCallUser,
                    candidate: event.candidate
                });
            }
        };

        peer.onconnectionstatechange = () => {
            if (peer.connectionState === "connected") {
                setCallStartTime(Date.now());
                startTimer();
            }

            if (
                CALL_STATE !== "IDLE" &&
                (peer.connectionState === "closed" ||
                    peer.connectionState === "failed")
            ) {
                cleanupCall();
                stopTimer();
                resetUI();

                setCallState("IDLE");
            }
        };

        if (isCaller) {
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);

            socket.emit("offer", {
                to: currentCallUser,
                offer
            });
        }

    } catch (err) {
        console.error("WebRTC error:", err);
    }
}

export async function handleOffer(offer) {

    if (!peer) await startWebRTC(false);

    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    setIsRemoteSet(true);

    iceQueue.forEach(c => peer.addIceCandidate(c));
    setIceQueue([]);

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socket.emit("answer", {
        to: currentCallUser,
        answer
    });
}

export async function handleAnswer(answer) {
    await peer.setRemoteDescription(new RTCSessionDescription(answer));

    setIsRemoteSet(true);

    iceQueue.forEach(c => peer.addIceCandidate(c));
    setIceQueue([]);
}

export function cleanupCall() {
    if (peer) {
        peer.close();
        setPeer(null);
    }

    if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
    }

    setIsRemoteSet(false);
    setIceQueue([]);

    const audio = document.getElementById("remoteAudio");

    if (audio) {
        audio.pause();
        audio.srcObject = null;
    }

    setCurrentCallUser(null);
    setCaller(null);

    setIsMuted(false);
    const muteBtn = document.getElementById("muteBtn");
    const remoteIndicator = document.getElementById("remoteMuteIndicator");

    if (muteBtn) {
        muteBtn.style.background = "";
        document.querySelector("#muteBtn svg").style.color = "var(--color-text-muted)";
    }

    if (remoteIndicator) {
        remoteIndicator.style.display = "none";
    }
}