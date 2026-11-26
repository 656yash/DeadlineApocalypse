import { isDefeated, need, rankName, todayS } from "../utils/game";
import BossCard from "./BossCard";

export function EmptyBossState({ onSpawn, onLoadDemo }) {
  return (
    <div className="empty">
      <b>☠️</b>
      <h3>NO BOSSES DETECTED</h3>
      <p>“The apocalypse is quiet... for now.”</p>
      <div className="row">
        <button className="btn" onClick={onSpawn}>
          SPAWN YOUR FIRST BOSS
        </button>
        <button className="btn g" onClick={onLoadDemo}>
          ✨ LOAD DEMO BOSSES
        </button>
      </div>
    </div>
  );
}

export default function DashboardView({
  player,
  bosses,
  onSpawn,
  onLoadDemo,
  onOpenChest,
  onWork,
  onEdit,
  onDelete
}) {
  const xpNeeded = need(player.level);
  const pct = Math.min(100, Math.round((player.xp / xpNeeded) * 100));
  const active = bosses.filter((b) => !isDefeated(b)).sort((a, b) => a.dueDate - b.dueDate);
  const featured = active[0];
  const chestOpened = player.chest === todayS();

  return (
    <div className="view-enter">
      <div className="dg">
        <div className="card pl">
          <div className="ring" style={{ "--v": pct }}>
            <div>
              <span>
                <b>{player.level}</b>LEVEL
              </span>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 900, letterSpacing: "0.1em" }}>
              LEVEL {player.level} · <span style={{ color: "var(--c)" }}>{rankName(player.level)}</span>
            </div>
            <div className="xb">
              <i style={{ width: `${pct}%` }} />
            </div>
            <div className="sub">
              {player.xp} / {xpNeeded} XP
            </div>
            <div className="xp" style={{ margin: "4px 0" }}>
              {Math.max(0, xpNeeded - player.xp)} XP TO LEVEL {player.level + 1}
            </div>
            <span className="chip">🔥 {player.streak} DAY STREAK</span>
          </div>
        </div>

        {featured ? (
          <BossCard
            boss={featured}
            featured
            animEnabled={Boolean(player.set.anim)}
            onWork={onWork}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ) : (
          <EmptyBossState onSpawn={onSpawn} onLoadDemo={onLoadDemo} />
        )}
      </div>

      <div
        className="card"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          marginBottom: 26,
          flexWrap: "wrap"
        }}
      >
        <div className={chestOpened ? "" : "chest"} style={{ fontSize: 52 }}>
          {chestOpened ? "📦" : "🎁"}
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <b>DAILY LOOT CHEST</b>
          <div className="sub">
            {chestOpened
              ? "Opened today. A new chest drops tomorrow."
              : "Free XP drop, common to legendary. One per day."}
          </div>
        </div>
        <button className="btn sm" style={{ width: "auto" }} disabled={chestOpened} onClick={onOpenChest}>
          {chestOpened ? "OPENED" : "OPEN CHEST"}
        </button>
      </div>

      <div className="sh">
        <h3>ACTIVE BOSSES</h3>
        <button className="btn sm" onClick={onSpawn}>
          + SPAWN NEW BOSS
        </button>
      </div>

      <div className="bg2">
        {active.length ? (
          active.map((boss) => (
            <BossCard
              key={boss.id}
              boss={boss}
              animEnabled={Boolean(player.set.anim)}
              onWork={onWork}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        ) : (
          <EmptyBossState onSpawn={onSpawn} onLoadDemo={onLoadDemo} />
        )}
      </div>
    </div>
  );
}
