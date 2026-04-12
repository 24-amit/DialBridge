let peer;

function createPeer() {
    peer = new RTCPeerConnection({
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" }
        ]
    });

    peer.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit("ice-candidate", {
                to: targetUser,
                candidate: event.candidate
            });
        }
    };

    peer.ontrack = (event) => {
        remoteAudio.srcObject = event.streams[0];
    };
}

const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

stream.getTracks().forEach(track => {
    peer.addTrack(track, stream);
});

const offer = await peer.createOffer();
await peer.setLocalDescription(offer);

socket.emit("offer", {
    to: targetUser,
    offer
});

socket.on("offer", async (offer) => {
    createPeer();

    await peer.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socket.emit("answer", {
        to: caller,
        answer
    });
});

socket.on("answer", async (answer) => {
    await peer.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on("ice-candidate", async (candidate) => {
    await peer.addIceCandidate(new RTCIceCandidate(candidate));
});