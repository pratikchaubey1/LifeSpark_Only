import React, { useState } from "react";
import OfficialRegisterPage from "./OfficialRegisterPage";
import WelcomePage from "./WelcomePage";

export default function AuthFlow({ onFinish }) {
  const [step, setStep] = useState("register"); // "register" | "welcome"
  const [userData, setUserData] = useState(null);

  async function handleRegisterSubmit(payload) {
    // yaha real API laga sakte ho
    // await api.register(payload);

    // simple random invite code
    const generatedInviteCode = `LS-${Math.floor(
      100000 + Math.random() * 900000
    )}`;

    setUserData({
      ...payload,
      inviteCode: generatedInviteCode,
    });

    setStep("welcome");
  }

  if (step === "welcome" && userData) {
    return (
      <WelcomePage
        userName={userData.name}
        email={userData.email}
        password={userData.password} // demo only
        inviteCode={userData.inviteCode}
        onContinue={
          onFinish ||
          (() => {
            console.log("Go to dashboard");
          })
        }
      />
    );
  }

  // default: register screen
  return (
    <OfficialRegisterPage
      onSubmit={handleRegisterSubmit}
      onGoToLogin={() => {
        console.log("Go to login from register");
      }}
    />
  );
}
