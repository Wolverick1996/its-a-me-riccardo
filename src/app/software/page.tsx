"use client";

import "@/styles/desktop/XP-scoped.css";
import "@/styles/desktop/desktop-shell.css";
import "@/styles/desktop/login-screen.css";
import { useSessionStore } from "@/store/useSessionStore";
import LoginScreen from "@/components/desktop/LoginScreen";
import WelcomeScreen from "@/components/desktop/WelcomeScreen";
import Desktop from "@/components/desktop/Desktop";

export default function SoftwarePage() {
  const stage = useSessionStore((state) => state.stage);

  if (stage === "login") return <LoginScreen />;
  if (stage === "welcome") return <WelcomeScreen />;
  return <Desktop />;
}
