import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAoA3skXYt00nNcV1efQx6aHtZtAhZ5ZqI",
    authDomain: "dialbridge-972c9.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);