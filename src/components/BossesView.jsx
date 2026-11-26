import { useState } from "react";
import { hp, isDefeated, urgency } from "../utils/game";
import BossCard from "./BossCard";
import { EmptyBossState } from "./DashboardView";

const FILTERS = [
  ["all", "ALL"],
  ["active", "ACTIVE"],
  ["soon", "DUE SOON"],
  ["done", "DEFEATED"]
];

export default function BossesView({
  player,
  bosses,
  onSpawn,
  onLoadDemo,
  onWork,
  onEdit,
  onDelete
}) {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("due");

  let list = bosses.slice();
  const q = searchQuery.toLowerCase();
  if (filter === "active") list = list.filter((b) => !isDefeated(b));
  else if (filter === "soon")
    list = list.filter(
      (b) => !isDefeated(b) && ["danger", "critical", "overdue"].includes(urgency(b))
    );
  else if (filter === "done") list = list.filter((b) => isDefeated(b));

  if (q) {
    list = list.filter((b) =>
      `${b.title || ""} ${b.subject || ""} ${b.desc || ""}`.toLowerCase().includes(q)
    );
  }

  list.sort(
    sortBy === "hp"
      ? (a, b) => hp(b) - hp(a)
      : sortBy === "xp"
        ? (a, b) => b.xp - a.xp
        : (a, b) => a.dueDate - b.dueDate
  );

  return (
    <div className="view-enter">
      <div className="sh">
        <h3>ALL BOSSES</h3>
        <button className="btn sm" onClick={onSpawn}>
          + SPAWN NEW BOSS
        </button>
      </div>

      <div className="tabs">
        {FILTERS.map(([key, label]) => (
          <button
            key={key}
            className={`tab ${filter === key ? "on" : ""}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="tools">
        <input
          placeholder="Search bosses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search"
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort">
          <option value="due">Sort: due date</option>
          <option value="hp">Sort: highest HP</option>
          <option value="xp">Sort: most XP</option>
        </select>
      </div>

      <div className="bg2">
        {list.length ? (
          list.map((boss) => (
            <BossCard
              key={boss.id}
              boss={boss}
              animEnabled={Boolean(player.set.anim)}
              onWork={onWork}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        ) : bosses.length ? (
          <div className="empty">
            <b>🔍</b>
            <h3>NO MATCHES</h3>
            <p>Try another filter or search.</p>
          </div>
        ) : (
          <EmptyBossState onSpawn={onSpawn} onLoadDemo={onLoadDemo} />
        )}
      </div>
    </div>
  );
}
