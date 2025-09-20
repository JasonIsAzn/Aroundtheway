"use client";

import { GoogleLogin } from "@react-oauth/google";
import { googleLogin } from "@/lib/auth.client";

export default function LoginPage() {
  const onGoogleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;
      if (!idToken) throw new Error("Missing Google credential");

      const user = await googleLogin(idToken);
      console.log("Logged in via Google:", user);

      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert(`Google login failed: ${err.message || "Unknown error"}`);
    }
  };

  const onGoogleError = () => {
    alert("Google login failed");
  };

  return (
    <main className="p-6">
      <GoogleLogin onSuccess={onGoogleSuccess} onError={onGoogleError} />
    </main>
  );
}
