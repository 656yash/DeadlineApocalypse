const NAV_ITEMS = [
  ["dashboard", "▦", "Dashboard"],
  ["bosses", "☠", "Bosses"],
  ["quests", "🎯", "Quests"],
  ["progress", "📊", "Progress"]
];

export default function Sidebar({
  user,
  player,
  view,
  onNavigate,
  onLogout,
  syncState,
  syncMessage
}) {
  const initial = (player.name || "S")[0].toUpperCase();
  const dotClass = syncState === "syncing" ? "syncing" : syncState === "error" ? "error" : "";
  const syncLabel =
    syncState === "syncing"
      ? "Saving to Firestore..."
      : syncState === "error"
        ? "Firestore Error"
        : "Firebase Synced";

  return (
    <>
      <aside className="side">
        <div className="logo">
          <b>☠️</b>
          <span>
            DEADLINE
            <br />
            APOCALYPSE
          </span>
        </div>

        {user && (
          <div className="user-pill">
            <div className="av" style={{ width: 34, height: 34, fontSize: 14 }}>
              {user.photoURL ? <img src={user.photoURL} alt={initial} /> : initial}
            </div>
            <div className="user-meta">
              <b>{player.name}</b>
              <small>{player.email || "Signed in"}</small>
            </div>
          </div>
        )}

        {NAV_ITEMS.map(([id, icon, label]) => (
          <button
            key={id}
            className={`ni ${view === id ? "on" : ""}`}
            onClick={() => onNavigate(id)}
          >
            {icon} {label}
          </button>
        ))}

        <div className="sp" />

        <div className="sync-badge" title={syncMessage}>
          <span className={`sync-dot ${dotClass}`} />
          <span>{syncLabel}</span>
        </div>

        <button
          className={`ni ${view === "settings" ? "on" : ""}`}
          onClick={() => onNavigate("settings")}
        >
          ⚙ Settings
        </button>
        <button className="ni" onClick={onLogout}>
          ⏻ Logout
        </button>
      </aside>

      <nav className="bnav">
        {NAV_ITEMS.concat([["settings", "⚙", "Settings"]]).map(([id, icon, label]) => (
          <button
            key={id}
            className={view === id ? "on" : ""}
            onClick={() => onNavigate(id)}
          >
            <b>{icon}</b>
            {label}
          </button>
        ))}
      </nav>
    </>
  );
}
