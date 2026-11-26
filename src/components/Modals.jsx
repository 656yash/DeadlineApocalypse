import { useState } from "react";
import { calcBossLevel, dueText, eod, hp } from "../utils/game";

function formatDateInput(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function BossModal({ boss, onClose, onSave }) {
  const [title, setTitle] = useState(boss?.title || "");
  const [subject, setSubject] = useState(boss?.subject || "");
  const [desc, setDesc] = useState(boss?.desc || "");
  const [dueDateStr, setDueDateStr] = useState(formatDateInput(boss ? boss.dueDate : eod(3)));
  const [weightage, setWeightage] = useState(boss?.weightage || 20);
  const [err, setErr] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setErr("Assignment name is required.");
      return;
    }
    if (!dueDateStr) {
      setErr("Due date is required.");
      return;
    }
    const w = Math.min(100, Math.max(1, Number(weightage) || 10));
    const dueDate = new Date(`${dueDateStr}T23:59:00`).getTime();
    const level = calcBossLevel(w);
    onSave({
      title: title.trim(),
      subject: subject.trim() || "General",
      desc: desc.trim(),
      dueDate,
      weightage: w,
      level,
      xp: level * 25
    });
  }

  return (
    <div className="mo" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="md" role="dialog" aria-modal="true">
        <h3>{boss ? "✎ EDIT BOSS" : "☠️ SPAWN NEW BOSS"}</h3>
        <div className="sub">
          {boss ? "Update boss details in Firestore." : "Turn an assignment into a LVL 1–10 boss."}
        </div>

        <form className="f" onSubmit={handleSubmit}>
          <label>
            ASSIGNMENT NAME
            <input
              maxLength={60}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErr("");
              }}
              placeholder="e.g. OS Lab Report"
              autoFocus
            />
          </label>
          <label>
            SUBJECT
            <input
              maxLength={40}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Operating Systems"
            />
          </label>
          <label>
            DESCRIPTION
            <textarea
              rows={2}
              maxLength={200}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Notes or chapters..."
            />
          </label>
          <label>
            DUE DATE
            <input
              type="date"
              value={dueDateStr}
              onChange={(e) => setDueDateStr(e.target.value)}
            />
          </label>
          <label>
            WEIGHTAGE (% OF GRADE → BOSS LVL 1–10)
            <input
              type="number"
              min={1}
              max={100}
              value={weightage}
              onChange={(e) => setWeightage(e.target.value)}
            />
          </label>
          {err && <div className="err-box">{err}</div>}
          <div className="qk" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <button type="button" className="btn g" onClick={onClose}>
              CANCEL
            </button>
            <button type="submit" className="btn">
              {boss ? "SAVE CHANGES" : "☠️ SPAWN BOSS"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function WorkModal({ boss, onClose, onDealDamage }) {
  const start = boss.progress || 0;
  const [val, setVal] = useState(start);
  const delta = val - start;

  return (
    <div className="mo" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="md" role="dialog" aria-modal="true">
        <h3>⚔ {(boss.title || "").toUpperCase()}</h3>
        <div className="sub">
          {boss.subject} · {dueText(boss)}
        </div>

        <div className="pv">
          <div>
            <small>CURRENT PROGRESS</small>
            <b>{start}%</b>
          </div>
          <div>
            <small>CURRENT HP</small>
            <b style={{ color: "var(--o)" }}>{hp(boss)}%</b>
          </div>
        </div>

        <input
          type="range"
          min={start}
          max={100}
          value={val}
          onChange={(e) => setVal(Number(e.target.value))}
          aria-label="New progress"
        />

        <div className="qk">
          {[10, 25, 50].map((inc) => (
            <button
              key={inc}
              type="button"
              className="btn g sm"
              onClick={() => setVal((v) => Math.min(100, v + inc))}
            >
              +{inc}%
            </button>
          ))}
        </div>

        <div className="pv">
          <div>
            <small>NEW PROGRESS</small>
            <b>{val}%</b>
          </div>
          <div>
            <small>BOSS HP AFTER</small>
            <b style={{ color: "var(--c)" }}>{100 - val}%</b>
          </div>
          <div>
            <small>XP GAIN</small>
            <b className="xp">+{Math.round((boss.xp * delta) / 100)}</b>
          </div>
        </div>

        <div className="qk" style={{ gridTemplateColumns: "1fr 1.4fr" }}>
          <button type="button" className="btn g" onClick={onClose}>
            CANCEL
          </button>
          <button
            type="button"
            className="btn"
            disabled={delta <= 0}
            onClick={(e) => onDealDamage(boss, val, e)}
          >
            ⚔ DEAL DAMAGE
          </button>
        </div>
      </div>
    </div>
  );
}

export function QuestModal({ onClose, onAdd }) {
  const [title, setTitle] = useState("");
  const [xpReward, setXpReward] = useState(100);
  const [err, setErr] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setErr("Quest title is required.");
      return;
    }
    onAdd(title.trim(), Number(xpReward) || 100);
  }

  return (
    <div className="mo" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="md" role="dialog" aria-modal="true">
        <h3>🎯 NEW DAILY QUEST</h3>
        <div className="sub">Add a daily study goal saved in Firebase Firestore.</div>
        <form className="f" onSubmit={handleSubmit}>
          <label>
            QUEST TITLE
            <input
              maxLength={60}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErr("");
              }}
              placeholder="e.g. Solve 5 LeetCode problems"
              autoFocus
            />
          </label>
          <label>
            XP REWARD
            <select value={xpReward} onChange={(e) => setXpReward(Number(e.target.value))}>
              <option value={50}>+50 XP (Quick)</option>
              <option value={100}>+100 XP (Standard)</option>
              <option value={150}>+150 XP (Deep Work)</option>
              <option value={200}>+200 XP (Boss Prep)</option>
            </select>
          </label>
          {err && <div className="err-box">{err}</div>}
          <div className="qk" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <button type="button" className="btn g" onClick={onClose}>
              CANCEL
            </button>
            <button type="submit" className="btn">
              ADD QUEST
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function VictoryOverlay({ overlay, onClose }) {
  if (!overlay) return null;

  return (
    <div className="ov" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div>
        <div className="sk">{overlay.type === "defeat" ? "☠️" : "⬆"}</div>
        <h1>{overlay.type === "defeat" ? "BOSS DEFEATED" : "LEVEL UP!"}</h1>
        {overlay.type === "defeat" ? (
          <>
            <h3 style={{ marginTop: 8, letterSpacing: "0.1em" }}>
              {(overlay.title || "").toUpperCase()}
            </h3>
            <div className="xpn">+{overlay.xp} XP</div>
            {overlay.leveledUp && <div className="lu">⬆ LEVEL UP! LEVEL {overlay.level}</div>}
            <div
              className="sub"
              style={{ margin: "10px 0 24px", letterSpacing: "0.2em", fontWeight: 800 }}
            >
              DEADLINE CLEARED
            </div>
          </>
        ) : (
          <div className="xpn">LEVEL {overlay.level}</div>
        )}
        <button className="btn" onClick={onClose}>
          CONTINUE
        </button>
      </div>
    </div>
  );
}
