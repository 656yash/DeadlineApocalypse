export default function Topbar({ user, player, combo }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  const initial = (player.name || "S")[0].toUpperCase();
  const showCombo = combo && Date.now() - combo.t < 9e4 && combo.n > 1;
  const mult = showCombo ? Math.min(2, 1 + (combo.n - 1) * 0.25).toFixed(2) : null;

  return (
    <div className="tb">
      <div>
        <h2>
          Good {greeting}, {player.name}.
        </h2>
        <p>Ready to defeat some deadlines?</p>
      </div>
      <div className="chips">
        {showCombo && <span className="chip combo">⚡ COMBO x{mult}</span>}
        <span className="chip">🔥 {player.streak} DAY STREAK</span>
        <span className="chip">⭐ {player.xp} XP</span>
        <span className="chip">LEVEL {player.level}</span>
        <div className="av">
          {user?.photoURL ? <img src={user.photoURL} alt={initial} /> : initial}
        </div>
      </div>
    </div>
  );
}
