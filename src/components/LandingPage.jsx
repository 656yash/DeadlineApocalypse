const STEPS = [
  ["01", "SPAWN A BOSS", "Add subject, due date & weightage."],
  ["02", "DEAL DAMAGE", "Work on the task to drop Boss HP."],
  ["03", "EARN XP", "Defeat bosses & finish daily quests."],
  ["04", "LEVEL UP", "Reach 100 × N XP & build your streak."]
];

const FEATURES = [
  {
    key: "skull",
    title: "DEADLINE BOSSES",
    desc: "Every assignment spawns a LVL 1–10 boss.",
    path: '<path d="M12 3a8 8 0 0 0-8 8c0 2.5 1 4 3 5v4h10v-4c2-1 3-2.5 3-5a8 8 0 0 0-8-8z"/><circle cx="9" cy="11" r="1.4"/><circle cx="15" cy="11" r="1.4"/>'
  },
  {
    key: "sword",
    title: "DAMAGE SYSTEM",
    desc: "HP % = 100 − completion %.",
    path: '<path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"/>'
  },
  {
    key: "star",
    title: "XP & LEVELS",
    desc: "Level N requires 100 × N XP.",
    path: '<path d="M12 2l3 7 7 .6-5.3 4.8 1.6 7.1L12 17.8 5.7 21.5l1.6-7.1L2 9.6 9 9z"/>'
  },
  {
    key: "target",
    title: "DAILY QUESTS",
    desc: "Complete quick tasks (+100 / +150 / +200 XP).",
    path: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>'
  },
  {
    key: "flame",
    title: "URGENCY COLOURS",
    desc: "Green → Amber → Red as due dates near.",
    path: '<path d="M12 2c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/>'
  },
  {
    key: "chart",
    title: "FIREBASE CLOUD",
    desc: "Users, assignments & quests in Firestore.",
    path: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'
  }
];

function PreviewBoss({ name, lvl, hpPct, due, urgencyClass, onEnter }) {
  return (
    <div className={`boss big feat ${urgencyClass}`}>
      <div className="bt">
        <span>☠️ DEADLINE BOSS</span>
        <span className="badge">⚠ {due}</span>
      </div>
      <h3>{name}</h3>
      <span className="lv">LVL {lvl}</span>
      <div className="hl">
        <span>BOSS HP</span>
        <b>{hpPct}%</b>
      </div>
      <div className="hp">
        <i style={{ width: `${hpPct}%` }} />
      </div>
      <div className="pc">{100 - hpPct}% COMPLETE</div>
      <div className="bf">
        <span className="due">⚠ {due}</span>
        <button className="btn sm" onClick={onEnter}>
          ⚔ WORK ON IT
        </button>
      </div>
    </div>
  );
}

export default function LandingPage({ isLoggedIn, onEnter }) {
  return (
    <div id="land">
      <nav className="top">
        <div className="wrap">
          <div className="logo">
            <b>☠️</b>
            <span>
              THE DEADLINE
              <br />
              APOCALYPSE
            </span>
          </div>
          <div className="links">
            <a href="#top">HOME</a>
            <a href="#how">HOW IT WORKS</a>
            <a href="#feat">FEATURES</a>
          </div>
          <div className="nav-actions">
            <button className="btn sm" onClick={onEnter}>
              {isLoggedIn ? "OPEN APP" : "LOGIN / SIGN UP"}
            </button>
          </div>
        </div>
      </nav>

      <div className="wrap" id="top">
        <div className="hero">
          <div>
            <h1>
              YOUR ASSIGNMENTS ARE <span>THE ENEMIES.</span>
            </h1>
            <h2>Every Deadline Is a Boss.</h2>
            <p>
              Turn assignments, practicals and study goals into boss enemies with HP, levels, and
              green → amber → red urgency. Work on tasks, deal damage, earn XP, and level up —
              powered by Firebase.
            </p>
            <div className="row">
              <button className="btn" onClick={onEnter}>
                ⚔ START DEFEATING DEADLINES
              </button>
              <a className="btn g" href="#how">
                SEE HOW IT WORKS
              </a>
            </div>
          </div>
          <div className="float">
            <PreviewBoss
              name="DBMS ASSIGNMENT"
              lvl={8}
              hpPct={75}
              due="DUE IN 4 DAYS"
              urgencyClass="u-warning"
              onEnter={onEnter}
            />
          </div>
        </div>
      </div>

      <section className="s" id="how">
        <div className="wrap">
          <h2 className="t">Four steps from assignment to level up</h2>
          <div className="g4">
            {STEPS.map(([num, title, desc]) => (
              <div className="card step" key={num}>
                <b>{num}</b>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="s" id="feat">
        <div className="wrap">
          <h2 className="t">Everything you need to win</h2>
          <div className="g3">
            {FEATURES.map((f) => (
              <div className="card feat" key={f.key}>
                <svg viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: f.path }} />
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="s">
        <div className="wrap split">
          <div>
            <h2 className="t">The core loop</h2>
            <div className="flow">
              <div>ASSIGNMENT</div>
              <i>↓</i>
              <div>BOSS (LVL 1–10)</div>
              <i>↓</i>
              <div>DAMAGE (−HP %)</div>
              <i>↓</i>
              <div>XP &amp; DAILY QUESTS</div>
              <i>↓</i>
              <div>LEVEL UP (100 × N XP)</div>
            </div>
          </div>
          <PreviewBoss
            name="AI ASSIGNMENT"
            lvl={9}
            hpPct={20}
            due="DUE TOMORROW"
            urgencyClass="u-critical"
            onEnter={onEnter}
          />
        </div>
      </section>

      <div className="wrap">
        <div className="cta">
          <h2 className="t" style={{ margin: 0 }}>
            READY TO DEFEAT YOUR DEADLINES?
          </h2>
          <p>Stop procrastinating. Start defeating.</p>
          <button className="btn" onClick={onEnter}>
            ☠️ ENTER THE APOCALYPSE
          </button>
        </div>
        <footer>
          The Deadline Apocalypse · Powered exclusively by Firebase Auth &amp; Cloud Firestore
        </footer>
      </div>
    </div>
  );
}
