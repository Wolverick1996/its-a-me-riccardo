"use client";

import { useEffect, useState } from "react";
import cx from "classnames";
import { useSessionStore } from "@/store/useSessionStore";
import XpLogo from "./XpLogo";

/** Single hard-coded account, same treatment StartMenu.tsx already gives its own "RickXP" header text — this is Desktop shell chrome, not shared portfolio content, so it doesn't belong in src/content/. */
const ACCOUNT_NAME = "Riccardo Corona";
/** Real XP shows a status line under the account name ("n programs running.") — this stands in for it the same way the rest of this screen swaps real XP chrome for personal-site equivalents. */
const ACCOUNT_ROLE = "Software Engineer";

/** How long the account tile's own selection glow (the ".logging-in" state in login-screen.css) holds after being clicked, before the stage actually switches to WelcomeScreen — an approximate "about 1s" per the user's own description, not a real XP video reference (none available, same caveat WelcomeScreen's own animation already carries). */
const LOGIN_TRANSITION_MS = 1000;

export default function LoginScreen() {
  const logIn = useSessionStore((state) => state.logIn);
  const shutDown = useSessionStore((state) => state.shutDown);
  /** Real XP dims every account tile and the "Turn off computer" control the instant the mouse moves anywhere on the screen (not just over one of them) — starts false so everything reads at full brightness on first paint, before the user has done anything, then flips true (and stays true) on the first mousemove. Only :hover/:focus-visible un-dims a given control back. */
  const [hasMoved, setHasMoved] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (hasMoved) return;
    function handleMove() {
      setHasMoved(true);
    }
    window.addEventListener("mousemove", handleMove, { once: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, [hasMoved]);

  function handleLogIn() {
    // Guards against a second click re-triggering the timer mid-transition.
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setTimeout(logIn, LOGIN_TRANSITION_MS);
  }

  return (
    <div
      className={cx("win-xp-shell", "login-screen", {
        "logging-in": isLoggingIn,
      })}
    >
      <div className="login-screen-bar login-screen-bar-top" />
      <div className="login-screen-body">
        <div className="login-screen-info">
          <XpLogo prefix="login-screen-logo" />
          <p className="login-screen-hint">To begin, click your user name</p>
        </div>
        <div className="login-screen-divider" />
        <div className="login-screen-users">
          <button
            type="button"
            className={cx("login-screen-user", {
              dimmed: hasMoved && !isLoggingIn,
            })}
            onClick={handleLogIn}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static export has no image optimization server. */}
            <img src="/user-7.svg" alt="" className="login-screen-avatar" />
            <div className="login-screen-user-info">
              <span className="login-screen-username">{ACCOUNT_NAME}</span>
              <span className="login-screen-user-role">{ACCOUNT_ROLE}</span>
            </div>
          </button>
        </div>
      </div>
      <div className="login-screen-bar login-screen-bar-bottom">
        <button
          type="button"
          className={cx("login-screen-shutdown", { dimmed: hasMoved })}
          onClick={shutDown}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static export has no image optimization server. */}
          <img
            src="/icons/desktop/Power.png"
            alt=""
            className="login-screen-shutdown-icon"
          />
          <span className="login-screen-shutdown-label">Turn off computer</span>
        </button>
        <p className="login-screen-help">
          After you log on, you can add or change accounts.
          <br />
          Just go to Control Panel and click User Accounts.
        </p>
      </div>
    </div>
  );
}
