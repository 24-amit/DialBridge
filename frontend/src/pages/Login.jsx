import { auth } from "../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

let confirmationResult;

export const sendOTP = async (phoneNumber) => {
  window.recaptchaVerifier = new RecaptchaVerifier(
    auth,
    "recaptcha-container",
    {
      size: "invisible",
    },
  );

  const appVerifier = window.recaptchaVerifier;

  confirmationResult = await signInWithPhoneNumber(
    auth,
    phoneNumber,
    appVerifier,
  );
};

export const verifyOTP = async (otp) => {
  const result = await confirmationResult.confirm(otp);

  // 🔥 THIS PART YOU ASKED ABOUT
  const token = await result.user.getIdToken();

  await fetch("/api/auth/firebase-login", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: "Amit" }),
  });
};
