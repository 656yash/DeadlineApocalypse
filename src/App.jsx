import { useCallback, useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { auth } from "./firebase/config";
import {
  commitBossDamage,
  completeQuestBatch,
  createAssignment,
  createQuest,
  deleteAssignment,
  removeQuest,
  resetUserWorkspace,
  seedDemoBosses,
  subscribeUserWorkspace,
  updateAssignment,
  updatePlayerFields
} from "./firebase/db";
import { ACHIEVEMENTS, applyXpGain, emptyPlayerDoc, todayS } from "./utils/game";
import {
  playBeep,
  spawnFloatText,
  spawnShockwaveRings,
  triggerConfettiBurst,
  triggerHitFx
} from "./utils/fx";
import ParticleCanvas from "./components/ParticleCanvas";
import LandingPage from "./components/LandingPage";
import AuthModal from "./components/AuthModal";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import DashboardView from "./components/DashboardView";
import BossesView from "./components/BossesView";
import QuestsView from "./components/QuestsView";
import ProgressView from "./components/ProgressView";
import SettingsView from "./components/SettingsView";
import { BossModal, QuestModal, VictoryOverlay, WorkModal } from "./components/Modals";

export default function App() {
  const fxCanvasRef = useRef(null);
  const pendingNameRef = useRef("");
  const unsubRef = useRef(null);

  const [user, setUser] = useState(null);
  const [inApp, setInApp] = useState(false);
  const [view, setView] = useState("dashboard");
  const [player, setPlayer] = useState(() => emptyPlayerDoc(null));
  const [bosses, setBosses] = useState([]);
  const [quests, setQuests] = useState([]);
  const [combo, setCombo] = useState(null);

  const [showAuth, setShowAuth] = useState(false);
  const [bossModalState, setBossModalState] = useState({ open: false, boss: null });
  const [workBoss, setWorkBoss] = useState(null);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [overlay, setOverlay] = useState(null);
  const [toasts, setToasts] = useState([]);

  const [syncState, setSyncState] = useState("idle");
  const [syncMessage, setSyncMessage] = useState("Connected to Firebase Firestore");
  const [firestoreError, setFirestoreError] = useState("");

  const addToast = useCallback(
    (icon, title, sub = "") => {
      if (!player.set.notif && icon !== "⬆" && icon !== "🔐") return;
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, icon, title, sub }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    [player.set.notif]
  );

  const handleFirestoreError = useCallback((err) => {
    console.error("Firestore error:", err);
    const code = err?.code || "";
    let msg = err?.message || "Firestore connection error.";
    if (code === "permission-denied") {
      msg =
        "Firestore permission denied. Publish the rules from firestore.rules in Firebase Console -> Firestore Database -> Rules.";
    } else if (code === "failed-precondition" || msg.includes("database")) {
      msg =
        "Cloud Firestore is not created yet for project adwise-4e978. Create it in Firebase Console -> Firestore Database.";
    }
    setFirestoreError(msg);
    setSyncState("error");
    setSyncMessage(msg);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("noanim", !player.set.anim);
  }, [player.set.anim]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        setShowAuth(false);
        setBossModalState({ open: false, boss: null });
        setWorkBoss(null);
        setShowQuestModal(false);
        setOverlay(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const stopAuth = onAuthStateChanged(auth, async (nextUser) => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
      setUser(nextUser);
      if (nextUser) {
        setShowAuth(false);
        setInApp(true);
        setFirestoreError("");
        setSyncState("syncing");
        setSyncMessage("Connecting to Firebase Firestore...");
        try {
          const unsub = await subscribeUserWorkspace(nextUser, {
            pendingDisplayName: pendingNameRef.current,
            onPlayer: (p) => setPlayer(p),
            onBosses: (b) => setBosses(b),
            onQuests: (q) => setQuests(q),
            onError: handleFirestoreError,
            onSynced: () => {
              setFirestoreError("");
              setSyncState("synced");
              setSyncMessage("Firebase Firestore live");
            }
          });
          unsubRef.current = unsub;
        } catch (err) {
          handleFirestoreError(err);
        } finally {
          pendingNameRef.current = "";
        }
      } else {
        setInApp(false);
        setFirestoreError("");
        setPlayer(emptyPlayerDoc(null));
        setBosses([]);
        setQuests([]);
        setCombo(null);
      }
    });

    return () => {
      stopAuth();
      if (unsubRef.current) unsubRef.current();
    };
  }, [handleFirestoreError]);

  function checkAndSaveAchievements(nextPlayer, nextQuests, nextCombo) {
    const nextAch = { ...(nextPlayer.ach || {}) };
    let unlockedAny = false;
    ACHIEVEMENTS.forEach((a) => {
      if (!nextAch[a.id] && a.check(nextPlayer, nextQuests, nextCombo)) {
        nextAch[a.id] = 1;
        unlockedAny = true;
        setTimeout(() => {
          addToast("🏅", "ACHIEVEMENT UNLOCKED", a.title);
          spawnFloatText(`${a.icon} ${a.title}`, "cb");
          triggerConfettiBurst(
            fxCanvasRef.current,
            window.innerWidth / 2,
            window.innerHeight / 3,
            70,
            Boolean(nextPlayer.set.anim)
          );
          playBeep(990, 0.3, Boolean(nextPlayer.set.sound));
        }, 700);
      }
    });
    if (unlockedAny && user) {
      updatePlayerFields(user.uid, { ach: nextAch }).catch(handleFirestoreError);
    }
  }

  async function handleSaveBoss(data) {
    if (!user) return;
    try {
      setSyncState("syncing");
      if (bossModalState.boss) {
        await updateAssignment(bossModalState.boss.id, data);
        setBossModalState({ open: false, boss: null });
        addToast("✎", "BOSS UPDATED", data.title);
      } else {
        const nextStats = { ...player.stats, total: player.stats.total + 1 };
        const nextSpawned = player.spawned + 1;
        await createAssignment(user.uid, data, nextStats, nextSpawned);
        setBossModalState({ open: false, boss: null });
        if (view !== "bosses" && view !== "dashboard") setView("bosses");
        playBeep(180, 0.25, Boolean(player.set.sound));
        addToast("☠️", "NEW BOSS SPAWNED", `${data.title} · LVL ${data.level}`);
        checkAndSaveAchievements({ ...player, stats: nextStats, spawned: nextSpawned }, quests, combo);
      }
      setSyncState("synced");
    } catch (err) {
      handleFirestoreError(err);
    }
  }

  async function handleDeleteBoss(boss) {
    if (!window.confirm(`Delete "${boss.title}" from Firestore?`)) return;
    try {
      await deleteAssignment(boss.id);
      addToast("🗑", "Boss removed", boss.title);
    } catch (err) {
      handleFirestoreError(err);
    }
  }

  async function handleDealDamage(boss, nextProgress, e) {
    if (!user) return;
    const delta = nextProgress - (boss.progress || 0);
    if (delta <= 0) return;

    const now = Date.now();
    const nextCombo =
      combo && now - combo.t < 9e4 ? { n: combo.n + 1, t: now } : { n: 1, t: now };
    setCombo(nextCombo);
    const mult = Math.min(2, 1 + (nextCombo.n - 1) * 0.25);
    const xpGain = Math.round(((boss.xp * delta) / 100) * mult);
    const defeated = nextProgress >= 100;

    const { nextPlayer, levelsGained, streakChanged } = applyXpGain(player, xpGain);
    if (defeated) {
      nextPlayer.kills += 1;
      nextPlayer.stats.defeated += 1;
      nextPlayer.stats.subj[boss.subject] = (nextPlayer.stats.subj[boss.subject] || 0) + 1;
      nextPlayer.stats.wins = [{ n: boss.title, xp: boss.xp }, ...nextPlayer.stats.wins].slice(
        0,
        20
      );
    }
    if (delta >= 50) nextPlayer.crit = 1;

    setWorkBoss(null);
    try {
      setSyncState("syncing");
      await commitBossDamage(user.uid, boss.id, nextProgress, defeated, {
        level: nextPlayer.level,
        xp: nextPlayer.xp,
        streak: nextPlayer.streak,
        lastActiveDate: nextPlayer.lastActiveDate,
        stats: nextPlayer.stats,
        kills: nextPlayer.kills,
        crit: nextPlayer.crit
      });
      setSyncState("synced");
    } catch (err) {
      handleFirestoreError(err);
      return;
    }

    const px = e?.clientX || window.innerWidth / 2;
    const py = e?.clientY || window.innerHeight / 2;
    triggerConfettiBurst(fxCanvasRef.current, px, py, 60, Boolean(player.set.anim));
    playBeep(300, 0.15, Boolean(player.set.sound));
    triggerHitFx(boss.id, delta);
    if (streakChanged) {
      addToast(
        "🔥",
        nextPlayer.streak > 1 ? "Streak increased!" : "Streak started!",
        `${nextPlayer.streak} day streak`
      );
    }
    addToast("⚔", "Damage dealt!", `-${delta} HP`);
    spawnFloatText(`+${xpGain} XP`);
    if (delta >= 50) spawnFloatText("CRITICAL HIT!", "cr");
    if (mult > 1) setTimeout(() => spawnFloatText(`⚡ COMBO x${mult.toFixed(2)}`, "cb"), 250);

    checkAndSaveAchievements(nextPlayer, quests, nextCombo);

    if (defeated) {
      setTimeout(() => {
        playBeep(660, 0.4, Boolean(player.set.sound));
        triggerConfettiBurst(fxCanvasRef.current, undefined, undefined, 140, Boolean(player.set.anim));
        spawnShockwaveRings(Boolean(player.set.anim));
        setOverlay({
          type: "defeat",
          title: boss.title,
          xp: boss.xp,
          leveledUp: levelsGained > 0,
          level: nextPlayer.level
        });
        addToast("🏆", "Boss defeated!", boss.title);
        if (levelsGained > 0) addToast("⬆", "LEVEL UP!", `Level ${nextPlayer.level}`);
      }, 600);
    } else if (levelsGained > 0) {
      playBeep(880, 0.4, Boolean(player.set.sound));
      triggerConfettiBurst(fxCanvasRef.current, undefined, undefined, 140, Boolean(player.set.anim));
      spawnShockwaveRings(Boolean(player.set.anim));
      setOverlay({ type: "levelup", level: nextPlayer.level });
      addToast("⬆", "LEVEL UP!", `Level ${nextPlayer.level}`);
    }
  }

  async function handleCompleteQuest(q) {
    if (!user || q.done) return;
    const xp = q.xpReward || 100;
    const { nextPlayer, levelsGained, streakChanged } = applyXpGain(player, xp);
    try {
      await completeQuestBatch(user.uid, q.id, {
        level: nextPlayer.level,
        xp: nextPlayer.xp,
        streak: nextPlayer.streak,
        lastActiveDate: nextPlayer.lastActiveDate,
        stats: nextPlayer.stats
      });
    } catch (err) {
      handleFirestoreError(err);
      return;
    }

    playBeep(740, 0.15, Boolean(player.set.sound));
    if (streakChanged) addToast("🔥", "Streak updated!", `${nextPlayer.streak} day streak`);
    addToast("⭐", `+${xp} XP`, `Quest complete: ${q.title}`);
    spawnFloatText(`+${xp} XP`);
    const nextQuests = quests.map((item) => (item.id === q.id ? { ...item, done: true } : item));
    checkAndSaveAchievements(nextPlayer, nextQuests, combo);
    if (levelsGained > 0) {
      playBeep(880, 0.4, Boolean(player.set.sound));
      triggerConfettiBurst(fxCanvasRef.current, undefined, undefined, 140, Boolean(player.set.anim));
      spawnShockwaveRings(Boolean(player.set.anim));
      setOverlay({ type: "levelup", level: nextPlayer.level });
    }
  }

  async function handleOpenChest() {
    if (!user || player.chest === todayS()) return;
    const r = Math.random();
    const reward =
      r < 0.1
        ? ["LEGENDARY", 250]
        : r < 0.35
          ? ["EPIC", 150]
          : r < 0.65
            ? ["RARE", 75]
            : ["COMMON", 40];

    const { nextPlayer, levelsGained } = applyXpGain(player, reward[1]);
    nextPlayer.chest = todayS();
    nextPlayer.chests += 1;

    try {
      await updatePlayerFields(user.uid, {
        chest: nextPlayer.chest,
        chests: nextPlayer.chests,
        level: nextPlayer.level,
        xp: nextPlayer.xp,
        streak: nextPlayer.streak,
        lastActiveDate: nextPlayer.lastActiveDate,
        stats: nextPlayer.stats
      });
    } catch (err) {
      handleFirestoreError(err);
      return;
    }

    triggerConfettiBurst(
      fxCanvasRef.current,
      window.innerWidth / 2,
      window.innerHeight / 2,
      110,
      Boolean(player.set.anim)
    );
    spawnShockwaveRings(Boolean(player.set.anim));
    playBeep(700, 0.3, Boolean(player.set.sound));
    spawnFloatText(`+${reward[1]} XP`);
    addToast("🎁", `${reward[0]} LOOT!`, `+${reward[1]} XP`);
    checkAndSaveAchievements(nextPlayer, quests, combo);
    if (levelsGained > 0) {
      setTimeout(() => setOverlay({ type: "levelup", level: nextPlayer.level }), 900);
    }
  }

  async function handleLoadDemo() {
    if (!user) return;
    try {
      const added = await seedDemoBosses(
        user.uid,
        new Set(bosses.map((b) => b.title)),
        player.stats,
        player.spawned
      );
      if (!added) addToast("✨", "Demo bosses already loaded", "");
      else addToast("✨", "Demo bosses spawned!", `${added} assignments saved in Firestore`);
    } catch (err) {
      handleFirestoreError(err);
    }
  }

  async function handleReset() {
    if (!user || !window.confirm("Reset all your assignments, quests, and XP in Firebase?")) return;
    try {
      await resetUserWorkspace(user, bosses, quests);
      addToast("🔄", "Firebase data reset", "Starting fresh at Level 1");
    } catch (err) {
      handleFirestoreError(err);
    }
  }

  return (
    <>
      <ParticleCanvas animEnabled={Boolean(player.set.anim)} />
      <canvas id="fx" ref={fxCanvasRef} />

      <div id="toasts">
        {toasts.map((t) => (
          <div className="ts" key={t.id}>
            <b>{t.icon}</b>
            <div>
              {t.title}
              {t.sub && <small>{t.sub}</small>}
            </div>
          </div>
        ))}
      </div>

      {!inApp ? (
        <LandingPage
          isLoggedIn={Boolean(user)}
          onEnter={() => (user ? setInApp(true) : setShowAuth(true))}
        />
      ) : (
        <div id="app">
          <Sidebar
            user={user}
            player={player}
            view={view}
            onNavigate={(v) => {
              setView(v);
              window.scrollTo(0, 0);
            }}
            onLogout={async () => {
              await signOut(auth);
              addToast("🔐", "Signed out", "See you next battle");
            }}
            syncState={syncState}
            syncMessage={syncMessage}
          />
          <main>
            {firestoreError && (
              <div className="fb-alert">
                <b>🔥 Firebase Firestore Setup Required</b>
                {firestoreError}{" "}
                <a
                  href="https://console.firebase.google.com/project/adwise-4e978/firestore"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Firestore Console (adwise-4e978)
                </a>
              </div>
            )}

            <Topbar user={user} player={player} combo={combo} />

            <div id="view-root">
              {view === "dashboard" && (
                <DashboardView
                  player={player}
                  bosses={bosses}
                  onSpawn={() => setBossModalState({ open: true, boss: null })}
                  onLoadDemo={handleLoadDemo}
                  onOpenChest={handleOpenChest}
                  onWork={(boss) => setWorkBoss(boss)}
                  onEdit={(boss) => setBossModalState({ open: true, boss })}
                  onDelete={handleDeleteBoss}
                />
              )}
              {view === "bosses" && (
                <BossesView
                  player={player}
                  bosses={bosses}
                  onSpawn={() => setBossModalState({ open: true, boss: null })}
                  onLoadDemo={handleLoadDemo}
                  onWork={(boss) => setWorkBoss(boss)}
                  onEdit={(boss) => setBossModalState({ open: true, boss })}
                  onDelete={handleDeleteBoss}
                />
              )}
              {view === "quests" && (
                <QuestsView
                  quests={quests}
                  onAddQuest={() => setShowQuestModal(true)}
                  onCompleteQuest={handleCompleteQuest}
                  onDeleteQuest={(q) => removeQuest(q.id).catch(handleFirestoreError)}
                />
              )}
              {view === "progress" && (
                <ProgressView player={player} quests={quests} combo={combo} />
              )}
              {view === "settings" && (
                <SettingsView
                  player={player}
                  syncMessage={syncMessage}
                  onSaveName={async (name) => {
                    if (!user) return;
                    try {
                      await updateProfile(user, { displayName: name }).catch(() => {});
                      await updatePlayerFields(user.uid, { name });
                      addToast("✓", "Profile updated", name);
                    } catch (err) {
                      handleFirestoreError(err);
                    }
                  }}
                  onToggleSetting={async (key) => {
                    if (!user) return;
                    const nextSet = { ...player.set, [key]: player.set[key] ? 0 : 1 };
                    try {
                      await updatePlayerFields(user.uid, { set: nextSet });
                    } catch (err) {
                      handleFirestoreError(err);
                    }
                  }}
                  onLoadDemo={handleLoadDemo}
                  onReset={handleReset}
                  onLogout={async () => {
                    await signOut(auth);
                    addToast("🔐", "Signed out", "See you next battle");
                  }}
                />
              )}
            </div>
          </main>
        </div>
      )}

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onPendingName={(n) => {
            pendingNameRef.current = n;
          }}
          addToast={addToast}
        />
      )}

      {bossModalState.open && (
        <BossModal
          boss={bossModalState.boss}
          onClose={() => setBossModalState({ open: false, boss: null })}
          onSave={handleSaveBoss}
        />
      )}

      {workBoss && (
        <WorkModal
          boss={workBoss}
          onClose={() => setWorkBoss(null)}
          onDealDamage={handleDealDamage}
        />
      )}

      {showQuestModal && (
        <QuestModal
          onClose={() => setShowQuestModal(false)}
          onAdd={async (title, xpReward) => {
            if (!user) return;
            try {
              await createQuest(user.uid, title, xpReward);
              setShowQuestModal(false);
              addToast("🎯", "QUEST ADDED", title);
            } catch (err) {
              handleFirestoreError(err);
            }
          }}
        />
      )}

      <VictoryOverlay overlay={overlay} onClose={() => setOverlay(null)} />
    </>
  );
}
