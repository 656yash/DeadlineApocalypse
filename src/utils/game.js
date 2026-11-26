export const DAY = 864e5;

export const eod = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(23, 59, 0, 0);
  return d.getTime();
};

export const todayS = () => new Date().toDateString();
export const yesterdayS = () => new Date(Date.now() - DAY).toDateString();

export const dayIndex = (d = new Date()) =>
  Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / DAY);

// Level N requires 100 * N XP
export const need = (level) => 100 * level;

// Boss level 1-10 derived from assignment weightage
export const calcBossLevel = (weightage) =>
  Math.min(10, Math.max(1, Math.ceil((Number(weightage) || 10) / 10)));

export const hp = (boss) => Math.max(0, 100 - (boss.progress || 0));
export const isDefeated = (boss) => boss.status === "defeated" || (boss.progress || 0) >= 100;

export function urgency(boss) {
  if (isDefeated(boss)) return "done";
  const ms = boss.dueDate - Date.now();
  if (ms < 0) return "overdue";
  if (ms < DAY) return "critical";
  const d = Math.round(
    (new Date(boss.dueDate).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / DAY
  );
  return d <= 2 ? "danger" : d <= 7 ? "warning" : "safe";
}

export function dueText(boss) {
  if (isDefeated(boss)) return "DEADLINE CLEARED";
  const ms = boss.dueDate - Date.now();
  if (ms < 0) return "OVERDUE";
  if (ms < DAY) return "DUE IN " + Math.max(1, Math.floor(ms / 36e5)) + "H";
  const d = Math.round(
    (new Date(boss.dueDate).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / DAY
  );
  return d === 1 ? "DUE TOMORROW" : "DUE IN " + d + " DAYS";
}

export const URGENCY_LABELS = {
  safe: "SAFE",
  warning: "WARNING",
  danger: "DANGER",
  critical: "CRITICAL",
  overdue: "OVERDUE",
  done: "DEFEATED"
};

export const rankName = (level) =>
  level < 5
    ? "ROOKIE"
    : level < 10
      ? "APPRENTICE"
      : level < 15
        ? "DEADLINE SLAYER"
        : level < 20
          ? "WARLORD"
          : "APOCALYPSE REAPER";

export const ACHIEVEMENTS = [
  { id: "first", icon: "🩸", title: "First Blood", desc: "Defeat a boss", check: (p) => p.kills >= 1 },
  { id: "crit", icon: "💥", title: "Heavy Hitter", desc: "Deal 50%+ damage at once", check: (p) => Boolean(p.crit) },
  { id: "combo", icon: "⚡", title: "Combo Master", desc: "Chain 5 hits in a row", check: (_p, _q, combo) => Boolean(combo && combo.n >= 5) },
  { id: "quest", icon: "🎯", title: "Quest Hunter", desc: "Finish all daily quests", check: (_p, quests) => quests.length > 0 && quests.every((q) => q.done) },
  { id: "spawn", icon: "☠️", title: "Necromancer", desc: "Spawn 3 bosses", check: (p) => p.spawned >= 3 },
  { id: "chest", icon: "🎁", title: "Treasure Hunter", desc: "Open a loot chest", check: (p) => p.chests >= 1 },
  { id: "slay", icon: "🗡️", title: "Boss Slayer", desc: "Defeat 20 bosses total", check: (p) => p.stats.defeated >= 20 },
  { id: "lvl", icon: "👑", title: "Overlord", desc: "Reach level 15", check: (p) => p.level >= 15 }
];

export function emptyPlayerDoc(user, pendingDisplayName = "") {
  const name =
    user?.displayName?.trim() ||
    pendingDisplayName ||
    (user?.email ? user.email.split("@")[0] : "Slayer");
  return {
    name,
    email: user?.email || "",
    level: 1,
    xp: 0,
    streak: 0,
    lastActiveDate: "",
    stats: {
      total: 0,
      defeated: 0,
      xp: 0,
      week: [0, 0, 0, 0, 0, 0, 0],
      weekDay: dayIndex(),
      subj: {},
      wins: []
    },
    set: { notif: 1, sound: 1, anim: 1 },
    ach: {},
    kills: 0,
    spawned: 0,
    chests: 0,
    chest: "",
    crit: 0
  };
}

export function normalizePlayerDoc(raw, user, pendingDisplayName = "") {
  const base = emptyPlayerDoc(user, pendingDisplayName);
  const s = raw && typeof raw === "object" ? raw : {};
  const out = {
    ...base,
    ...s,
    stats: {
      ...base.stats,
      ...(s.stats || {}),
      week:
        Array.isArray(s.stats?.week) && s.stats.week.length === 7
          ? s.stats.week.slice()
          : [0, 0, 0, 0, 0, 0, 0],
      subj: s.stats?.subj && typeof s.stats.subj === "object" ? { ...s.stats.subj } : {},
      wins: Array.isArray(s.stats?.wins) ? s.stats.wins.slice(0, 20) : []
    },
    set: { ...base.set, ...(s.set || {}) },
    ach: s.ach && typeof s.ach === "object" ? { ...s.ach } : {}
  };
  if (user?.email) out.email = user.email;
  const curDay = dayIndex();
  const prevDay = Number.isFinite(out.stats.weekDay) ? out.stats.weekDay : curDay;
  const diff = curDay - prevDay;
  if (diff > 0) {
    out.stats.week =
      diff >= 7 ? [0, 0, 0, 0, 0, 0, 0] : out.stats.week.slice(diff).concat(Array(diff).fill(0));
    out.stats.weekDay = curDay;
  }
  return out;
}

export function applyXpGain(player, xpAmount) {
  const next = structuredClone(player);
  const prevLevel = next.level;
  next.xp += xpAmount;
  next.stats.xp += xpAmount;
  next.stats.week[6] += xpAmount;

  const today = todayS();
  let streakChanged = false;
  if (next.lastActiveDate !== today) {
    next.streak = next.lastActiveDate === yesterdayS() ? next.streak + 1 : 1;
    next.lastActiveDate = today;
    streakChanged = true;
  }
  while (next.xp >= need(next.level)) {
    next.xp -= need(next.level);
    next.level++;
  }
  return {
    nextPlayer: next,
    levelsGained: next.level - prevLevel,
    streakChanged
  };
}

export function starterQuests(uid) {
  const today = todayS();
  const now = Date.now();
  return [
    { userId: uid, title: "Web Tech Assignment", xpReward: 100, date: today, done: false, createdAt: now },
    { userId: uid, title: "DBMS Practical", xpReward: 150, date: today, done: false, createdAt: now + 1 },
    { userId: uid, title: "Study CN", xpReward: 200, date: today, done: false, createdAt: now + 2 }
  ];
}

export function starterDemoBosses(uid) {
  const now = Date.now();
  return [
    {
      userId: uid,
      title: "DBMS Assignment",
      subject: "DBMS",
      desc: "ER diagram & normalization queries",
      weightage: 80,
      level: 8,
      xp: 200,
      dueDate: eod(2),
      progress: 25,
      status: "active",
      createdAt: now
    },
    {
      userId: uid,
      title: "Web Technology Assignment",
      subject: "Web Technology",
      desc: "Responsive UI & Firebase integration",
      weightage: 60,
      level: 6,
      xp: 150,
      dueDate: eod(8),
      progress: 60,
      status: "active",
      createdAt: now + 1
    },
    {
      userId: uid,
      title: "Computer Networks Practical",
      subject: "Computer Networks",
      desc: "Socket programming lab report",
      weightage: 50,
      level: 5,
      xp: 125,
      dueDate: eod(4),
      progress: 40,
      status: "active",
      createdAt: now + 2
    },
    {
      userId: uid,
      title: "AI Assignment",
      subject: "AI",
      desc: "A* search heuristics writeup",
      weightage: 90,
      level: 9,
      xp: 225,
      dueDate: eod(1),
      progress: 80,
      status: "active",
      createdAt: now + 3
    }
  ];
}

export function friendlyAuthError(err) {
  const c = err?.code || "";
  if (c === "auth/configuration-not-found")
    return "Firebase Authentication is not enabled yet for project adwise-4e978. Open Firebase Console -> Authentication -> Get Started and enable Email/Password.";
  if (c === "auth/invalid-credential" || c === "auth/wrong-password" || c === "auth/user-not-found")
    return "Invalid email or password.";
  if (c === "auth/email-already-in-use")
    return "An account with this email already exists. Switch to Sign In.";
  if (c === "auth/weak-password") return "Password must be at least 6 characters.";
  if (c === "auth/invalid-email") return "Please enter a valid email address.";
  if (c === "auth/operation-not-allowed")
    return "This sign-in method is not enabled in Firebase Console (Authentication -> Sign-in method).";
  if (c === "auth/unauthorized-domain")
    return "This domain is not authorized in Firebase Console (Authentication -> Settings -> Authorized domains).";
  if (c === "auth/popup-closed-by-user") return "Google sign-in popup was closed.";
  if (c === "auth/popup-blocked") return "Popup was blocked by your browser. Allow popups for this site.";
  return err?.message || "Authentication failed. Please try again.";
}
