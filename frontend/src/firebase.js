import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAoA3skXYt00nNcV1efQx6aHtZtAhZ5ZqI",
    authDomain: "dialbridge-972c9.firebaseapp.com",
    projectId: "dialbridge-972c9",
    appId: "1:112453752302:web:180ceeb4b00997cfa7eaff"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const auth = getAuth(app);
export { db };