export default function QuestsView({ quests, onAddQuest, onCompleteQuest, onDeleteQuest }) {
  const doneCount = quests.filter((q) => q.done).length;

  return (
    <div className="view-enter">
      <div className="sh">
        <h3>
          TODAY&apos;S QUESTS · {doneCount}/{quests.length} DONE
        </h3>
        <button className="btn sm" onClick={onAddQuest}>
          + ADD QUEST
        </button>
      </div>

      {quests.length ? (
        quests.map((q) => (
          <div className="q-row" key={q.id}>
            <button
              className={`q ${q.done ? "done" : ""}`}
              onClick={() => !q.done && onCompleteQuest(q)}
            >
              <span className="bx">{q.done ? "✓" : ""}</span>
              <span>{q.title}</span>
              <span className="xp">+{q.xpReward} XP</span>
            </button>
            <button
              className="q-del"
              title="Remove quest"
              aria-label="Remove quest"
              onClick={() => onDeleteQuest(q)}
            >
              ✕
            </button>
          </div>
        ))
      ) : (
        <div className="empty">
          <b>🎯</b>
          <h3>NO DAILY QUESTS</h3>
          <p>Add a daily habit or study goal to earn bonus XP.</p>
          <div className="row">
            <button className="btn" onClick={onAddQuest}>
              + ADD QUEST
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
