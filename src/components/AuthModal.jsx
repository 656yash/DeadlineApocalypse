import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from "firebase/auth";
import { auth, googleProvider } from "../firebase/config";
import { updatePlayerFields } from "../firebase/db";
import { friendlyAuthError } from "../utils/game";

export default function AuthModal({ onClose, onPendingName, addToast }) {
  const [mode, setMode] = useState("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ text: "", ok: false });

  const isUp = mode === "signup";

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg({ text: "", ok: false });
    setBusy(true);
    try {
      if (isUp) {
        const cleanName = name.trim();
        onPendingName(cleanName);
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (cleanName) {
          await updateProfile(cred.user, { displayName: cleanName });
          await updatePlayerFields(cred.user.uid, { name: cleanName }).catch(() => {});
        }
        addToast("☠️", "Account created!", `Welcome, ${cleanName || email.trim()}`);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        addToast("⚔", "Welcome back!", email.trim());
      }
    } catch (err) {
      onPendingName("");
      setMsg({ text: friendlyAuthError(err), ok: false });
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setMsg({ text: "", ok: false });
    setBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
      addToast("🔐", "Signed in with Google", "Welcome to the arena");
    } catch (err) {
      setMsg({ text: friendlyAuthError(err), ok: false });
    } finally {
      setBusy(false);
    }
  }

  async function handleForgot() {
    if (!email.trim()) {
      setMsg({ text: "Enter your email above first, then click Forgot password.", ok: false });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMsg({ text: `Password reset link sent to ${email.trim()}`, ok: true });
    } catch (err) {
      setMsg({ text: friendlyAuthError(err), ok: false });
    }
  }

  return (
    <div className="mo" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="md" role="dialog" aria-modal="true">
        <h3>{isUp ? "☠️ CREATE YOUR SLAYER ACCOUNT" : "⚔ ENTER THE APOCALYPSE"}</h3>
        <div className="sub">
          {isUp
            ? "Create an account stored in Firebase Auth & Firestore."
            : "Sign in to load your bosses, quests, and XP from Firebase."}
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${!isUp ? "on" : ""}`}
            onClick={() => {
              setMode("signin");
              setMsg({ text: "", ok: false });
            }}
          >
            SIGN IN
          </button>
          <button
            type="button"
            className={`auth-tab ${isUp ? "on" : ""}`}
            onClick={() => {
              setMode("signup");
              setMsg({ text: "", ok: false });
            }}
          >
            CREATE ACCOUNT
          </button>
        </div>

        <form className="f" onSubmit={handleSubmit}>
          {isUp && (
            <label>
              DISPLAY NAME
              <input
                maxLength={40}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Yash"
                required
                autoFocus
              />
            </label>
          )}
          <label>
            EMAIL
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus={!isUp}
            />
          </label>
          <label>
            PASSWORD
            <input
              type="password"
              autoComplete={isUp ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              minLength={6}
              required
            />
          </label>

          {!isUp && (
            <button type="button" className="link-btn" onClick={handleForgot}>
              Forgot password?
            </button>
          )}

          {msg.text && (
            <div className={msg.ok ? "ok-box" : "err-box"}>
              {msg.text}
              {msg.text.includes("Authorized domains") && (
                <div style={{ marginTop: 6 }}>
                  <a
                    href="https://console.firebase.google.com/project/adwise-4e978/authentication/settings"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--c)", textDecoration: "underline" }}
                  >
                    Open Firebase Authorized Domains →
                  </a>
                </div>
              )}
            </div>
          )}

          <button type="submit" className="btn" disabled={busy}>
            {busy ? "CONNECTING..." : isUp ? "☠️ CREATE ACCOUNT" : "⚔ SIGN IN"}
          </button>
        </form>

        <div className="or-div">OR</div>
        <button type="button" className="btn g-btn" onClick={handleGoogle} disabled={busy}>
          🌐 Continue with Google
        </button>
      </div>
    </div>
  );
}
