import { URGENCY_LABELS, dueText, hp, isDefeated, urgency } from "../utils/game";

export default function BossCard({
  boss,
  featured = false,
  animEnabled = true,
  onWork,
  onEdit,
  onDelete
}) {
  const u = urgency(boss);
  const bossHp = hp(boss);
  const defeated = isDefeated(boss);

  function handleMouseMove(e) {
    if (!animEnabled) return;
    const r = e.currentTarget.getBoundingClientRect();
    const rx = -((e.clientY - r.top) / r.height - 0.5) * 10;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 10;
    e.currentTarget.style.transform = `perspective(700px) rotateY(${ry}deg) rotateX(${rx}deg) translateY(-4px)`;
  }

  function handleMouseLeave(e) {
    e.currentTarget.style.transform = "";
  }

  return (
    <div
      className={`boss u-${u} ${featured ? "big feat" : ""}`}
      data-id={boss.id}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="bt">
        <span>☠️ DEADLINE BOSS</span>
        <div className="bt-right">
          <span className="badge">{URGENCY_LABELS[u]}</span>
          <button
            className="icon-btn"
            title="Edit boss"
            aria-label="Edit boss"
            onClick={() => onEdit(boss)}
          >
            ✎
          </button>
          <button
            className="icon-btn del"
            title="Delete boss"
            aria-label="Delete boss"
            onClick={() => onDelete(boss)}
          >
            🗑
          </button>
        </div>
      </div>

      <h3>{(boss.title || "").toUpperCase()}</h3>
      <div className="sub">{boss.subject}</div>
      {boss.desc && <div className="bdesc">{boss.desc}</div>}
      <span className="lv">
        LVL {boss.level} · {boss.weightage || 10}%
      </span>

      <div className="hl">
        <span>BOSS HP</span>
        <b>{bossHp}%</b>
      </div>
      <div className="hp">
        <i style={{ width: `${bossHp}%` }} />
      </div>
      <div className="pc">{boss.progress || 0}% COMPLETE</div>

      <div className="bf">
        <span className="due">⚠ {dueText(boss)}</span>
        <span className="xp">+{boss.xp} XP</span>
        {defeated ? (
          <span className="badge">🏆 DEFEATED</span>
        ) : (
          <button className="btn sm" onClick={() => onWork(boss)}>
            ⚔ WORK ON IT
          </button>
        )}
      </div>
    </div>
  );
}
