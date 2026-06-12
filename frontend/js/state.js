export let socket = null;
export let myNumber = null;
export let currentCallUser = null;
export let SESSION_ID = crypto.randomUUID();
export let number = "";

export let callStartTime = null;
export let callSeconds = 0;
export let callTimerInterval = null;

export let caller = null;

export let peer = null;
export let localStream = null;

export let iceQueue = [];
export let isRemoteSet = false;

export let isMuted = false;
export let isSpeakerOn = false;

export let CALL_STATE = "IDLE";

export function setSocket(v) {
    socket = v;
}

export function setMyNumber(v) {
    myNumber = v;
}

export function setCurrentCallUser(v) {
    currentCallUser = v;
}

export function setNumber(v) {
    number = v;
}

export function setCaller(v) {
    caller = v;
}

export function setPeer(v) {
    peer = v;
}

export function setLocalStream(v) {
    localStream = v;
}

export function setCallState(v) {
    CALL_STATE = v;
}

export function setCallStartTime(v) {
    callStartTime = v;
}

export function setIsRemoteSet(v) {
    isRemoteSet = v;
}

export function setIceQueue(v) {
    iceQueue = v;
}

export function setIsMuted(v) {
    isMuted = v;
}

export function setIsSpeakerOn(v) {
    isSpeakerOn = v;
}

export function setCallSeconds(v) {
    callSeconds = v;
}

export function setCallTimerInterval(v) {
    callTimerInterval = v;
}