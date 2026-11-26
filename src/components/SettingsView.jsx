import { useEffect, useState } from "react";
import { need, rankName } from "../utils/game";

export default function SettingsView({
  player,
  syncMessage,
  onSaveName,
  onToggleSetting,
  onLoadDemo,
  onReset,
  onLogout
}) {
  const [nameInput, setNameInput] = useState(player.name);

  useEffect(() => {
    setNameInput(player.name);
  }, [player.name]);

  const rows = [
    ["Email", player.email || "—"],
    ["Database", "Firebase Firestore Only (users, assignments, quests)"],
    ["Rank", rankName(player.level)],
    ["Level", player.level],
    ["XP", `${player.xp} / ${need(player.level)}`],
    ["Streak", `${player.streak} days`],
    ["Sync Status", syncMessage]
  ];

  const toggles = [
    ["notif", "Notifications"],
    ["sound", "Sound Effects"],
    ["anim", "Animations"]
  ];

  return (
    <div className="view-enter two">
      <div className="card">
        <div className="sh">
          <h3>ACCOUNT &amp; PROFILE</h3>
        </div>
        <div className="f" style={{ marginTop: 0 }}>
          <label>
            DISPLAY NAME
            <div style={{ display: "flex", gap: 8 }}>
              <input
                style={{ flex: 1 }}
                maxLength={40}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
              />
              <button
                className="btn sm"
                onClick={() => nameInput.trim() && onSaveName(nameInput.trim())}
              >
                SAVE
              </button>
            </div>
          </label>
        </div>

        {rows.map(([label, val]) => (
          <div className="win" key={label}>
            <span className="sub">{label}</span>
            <b style={{ textAlign: "right", fontSize: 13 }}>{val}</b>
          </div>
        ))}

        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          <button className="btn danger sm" onClick={onLogout}>
            ⏻ LOGOUT
          </button>
        </div>
      </div>

      <div className="card">
        <div className="sh">
          <h3>PREFERENCES</h3>
        </div>
        {toggles.map(([key, label]) => (
          <div className="set" key={key}>
            <span>{label}</span>
            <button
              className={`tg ${player.set[key] ? "on" : ""}`}
              onClick={() => onToggleSetting(key)}
              role="switch"
              aria-checked={Boolean(player.set[key])}
              aria-label={label}
            />
          </div>
        ))}
        <div className="set">
          <span>Load demo bosses</span>
          <button className="btn g sm" onClick={onLoadDemo}>
            LOAD DEMO
          </button>
        </div>
        <div className="set">
          <span>Reset all Firebase data</span>
          <button className="btn danger sm" onClick={onReset}>
            RESET
          </button>
        </div>
      </div>
    </div>
  );
}
