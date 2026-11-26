import { ACHIEVEMENTS, DAY } from "../utils/game";

export default function ProgressView({ player, quests, combo }) {
  const s = player.stats;
  const maxWeek = Math.max(...s.week, 1);
  const subjEntries = Object.entries(s.subj || {});
  const maxSubj = Math.max(...subjEntries.map(([, v]) => v), 1);
  const days = s.week.map((_, i) =>
    new Date(Date.now() - (6 - i) * DAY).toLocaleDateString("en", { weekday: "short" })
  );
  const rate = s.total > 0 ? Math.min(100, Math.round((s.defeated / s.total) * 100)) : 0;

  const statCards = [
    ["TOTAL ASSIGNMENTS", s.total.toLocaleString()],
    ["BOSSES DEFEATED", s.defeated.toLocaleString()],
    ["COMPLETION RATE", `${rate}%`],
    ["TOTAL XP", s.xp.toLocaleString()],
    ["LEVEL", player.level],
    ["STREAK", `${player.streak} DAYS`]
  ];

  return (
    <div className="view-enter">
      <div className="sg">
        {statCards.map(([label, val]) => (
          <div className="card stat" key={label}>
            <small>{label}</small>
            <b>{val}</b>
          </div>
        ))}
      </div>

      <div className="two">
        <div className="card">
          <div className="sh">
            <h3>WEEKLY XP</h3>
          </div>
          <div className="ch">
            {s.week.map((v, i) => (
              <div key={i}>
                <span>{v}</span>
                <i style={{ height: `${Math.max(4, (v / maxWeek) * 78)}%` }} />
                <span>{days[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="sh">
            <h3>SUBJECT PRODUCTIVITY</h3>
          </div>
          {subjEntries.length ? (
            subjEntries.map(([subject, count]) => (
              <div className="sj" key={subject}>
                {subject} ({count})
                <div className="hp">
                  <i style={{ width: `${(count / maxSubj) * 100}%`, "--u": "var(--p)" }} />
                </div>
              </div>
            ))
          ) : (
            <div className="sub">Defeat bosses to unlock subject productivity stats.</div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="sh">
          <h3>
            ACHIEVEMENTS · {Object.keys(player.ach || {}).length}/{ACHIEVEMENTS.length}
          </h3>
        </div>
        <div className="ach">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = Boolean(player.ach?.[a.id] || a.check(player, quests, combo));
            return (
              <div className={`ab ${unlocked ? "on" : ""}`} key={a.id}>
                <b>{a.icon}</b>
                {a.title}
                <small>{a.desc}</small>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="sh">
          <h3>RECENT VICTORIES</h3>
        </div>
        {s.wins.length ? (
          s.wins.slice(0, 6).map((w, idx) => (
            <div className="win" key={idx}>
              <span>🏆 {w.n}</span>
              <span className="xp">+{w.xp} XP</span>
            </div>
          ))
        ) : (
          <div className="sub">No victories recorded yet. Defeat your first boss!</div>
        )}
      </div>
    </div>
  );
}
