import {
    myNumber,
    SESSION_ID,
    setMyNumber,
    setSocket,
    socket
} from "./state.js";

import { Store } from "./storage.js";
import { switchTab } from "./ui.js";
import { loadCallHistory } from "./history.js";
import { enableDialpadKeyboard } from "./dialpad.js";
import { setupSocketEvents } from "./socket.js";
import { cleanupCall } from "./webrtc.js";
import { stopTimer } from "./timer.js";

import {
    ref,
    set,
    onDisconnect,
    update,
    onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
    rtdb,
    formatPhone
} from "./firebase.js";

window.sendOTP = () => {
    let phone = document.getElementById('phone').value.trim().replace(/\D/g, "");
    const message = document.getElementById('msg');

    if (phone.length !== 10) {
        message.innerText = "Enter valid 10-digit phone number";
        message.className = "error";
        return;
    }

    Store.setItem("tempPhone", "+91" + phone);

    document.querySelector('.login-box').classList.add('hidden');
    document.getElementById('otpBox').classList.remove('hidden');

    message.innerText = "OTP sent";
    message.className = "success";

    setTimeout(() => {
        const otpInput = document.getElementById("otp");
        otpInput.focus();
    }, 200);
};

window.verifyOTP = async () => {
    const otp = document.getElementById('otp').value;
    const message = document.getElementById('msg');

    try {
        if (otp === "123456") {
            setMyNumber(Store.getItem("tempPhone"));
            if (!myNumber) {
                throw new Error("Phone number missing");
            }
            Store.setItem("userNumber", myNumber);

            message.innerText = "Login Successful";
            message.className = "success";

            setTimeout(() => {
                startApp();
            }, 200);
        } else {
            throw new Error("Invalid OTP");
        }
    } catch (error) {
        message.innerText = error.message;
        message.className = "error";
    }
};

window.logout = async () => {
    if (!myNumber) return;

    const userStatusRef = ref(rtdb, "status/" + myNumber);

    await set(userStatusRef, {
        online: false,
        lastSeen: Date.now()
    });

    Store.removeItem("userNumber");
    location.reload();
};

export async function startApp() {
    setMyNumber(myNumber || Store.getItem("userNumber"));

    const userStatusRef = ref(rtdb, "status/" + myNumber);
    const sessionRef = ref(rtdb, "sessions/" + myNumber);

    switchTab("dialpad");

    await set(userStatusRef, {
        online: true,
        lastSeen: Date.now()
    });

    await set(sessionRef, {
        sessionId: SESSION_ID,
        updatedAt: Date.now()
    });

    onValue(sessionRef, (snap) => {
        const data = snap.val();

        if (!data) return;

        if (data.sessionId !== SESSION_ID) {
            alert("Your account opened on another device");

            cleanupCall();
            stopTimer();

            Store.removeItem("userNumber");

            if (socket) {
                socket.disconnect();
            }
            location.reload();
        }
    });

    onDisconnect(userStatusRef).set({
        online: false,
        lastSeen: Date.now()
    });

    setInterval(() => {
        update(userStatusRef, {
            lastSeen: Date.now()
        });
    }, 30000);

    document.getElementById("userLabel").innerText = "You: +91 " + formatPhone(myNumber);
    document.getElementById('login').style.display = 'none';
    document.getElementById('app').style.display = 'block';

    enableDialpadKeyboard();

    loadCallHistory(myNumber);

    setSocket(
        io("https://dialbridge.onrender.com", {
            query: { userId: myNumber },
            transports: ["websocket"]
        })
    );

    socket.on("connect", () => {
        socket.emit("register", myNumber);
    });

    setupSocketEvents();
}