import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { getDatabase, ref } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAoA3skXYt00nNcV1efQx6aHtZtAhZ5ZqI",
    authDomain: "dialbridge-972c9.firebaseapp.com",
    projectId: "dialbridge-972c9",
    appId: "1:112453752302:web:180ceeb4b00997cfa7eaff"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const rtdb = getDatabase(app);

export const getCallStateRef = (num) =>
    ref(rtdb, "call_state/" + num);

export const formatPhone = (num) => {
    return num ? num.replace(/^\+91\s?/, "") : "";
};