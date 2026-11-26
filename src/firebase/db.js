import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  writeBatch
} from "firebase/firestore";
import { db } from "./config";
import {
  emptyPlayerDoc,
  normalizePlayerDoc,
  starterQuests,
  starterDemoBosses,
  todayS
} from "../utils/game";

/**
 * Initialize a user in Firestore (`users`, `assignments`, `quests`) and attach
 * real-time listeners. Returns an unsubscribe function that detaches all listeners.
 */
export async function subscribeUserWorkspace(user, callbacks) {
  const { onPlayer, onBosses, onQuests, onError, onSynced, pendingDisplayName = "" } = callbacks;
  const unsubs = [];

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const initialUser = emptyPlayerDoc(user, pendingDisplayName);
    await setDoc(userRef, { ...initialUser, createdAt: Date.now(), updatedAt: Date.now() });
    onPlayer(initialUser);
  } else {
    const normalized = normalizePlayerDoc(userSnap.data(), user, pendingDisplayName);
    onPlayer(normalized);
    if (userSnap.data().stats?.weekDay !== normalized.stats.weekDay) {
      await updateDoc(userRef, { stats: normalized.stats, updatedAt: Date.now() });
    }
  }

  // Ensure starter daily quests exist and roll over completed flags on a new day
  const qSnap = await getDocs(query(collection(db, "quests"), where("userId", "==", user.uid)));
  if (qSnap.empty) {
    const batch = writeBatch(db);
    starterQuests(user.uid).forEach((q) => {
      batch.set(doc(collection(db, "quests")), q);
    });
    await batch.commit();
  } else {
    const today = todayS();
    const stale = qSnap.docs.filter((d) => d.data().date !== today);
    if (stale.length) {
      const batch = writeBatch(db);
      stale.forEach((d) => batch.update(d.ref, { date: today, done: false }));
      await batch.commit();
    }
  }

  unsubs.push(
    onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          onPlayer(normalizePlayerDoc(snap.data(), user, pendingDisplayName));
          onSynced?.();
        }
      },
      onError
    )
  );

  unsubs.push(
    onSnapshot(
      query(collection(db, "assignments"), where("userId", "==", user.uid)),
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        onBosses(list);
        onSynced?.();
      },
      onError
    )
  );

  unsubs.push(
    onSnapshot(
      query(collection(db, "quests"), where("userId", "==", user.uid)),
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        onQuests(list);
        onSynced?.();
      },
      onError
    )
  );

  onSynced?.();
  return () => unsubs.forEach((u) => u());
}

export async function updatePlayerFields(uid, patch) {
  await updateDoc(doc(db, "users", uid), { ...patch, updatedAt: Date.now() });
}

export async function createAssignment(uid, data, nextStats, nextSpawned) {
  const batch = writeBatch(db);
  const ref = doc(collection(db, "assignments"));
  batch.set(ref, {
    userId: uid,
    ...data,
    progress: 0,
    status: "active",
    createdAt: Date.now()
  });
  batch.update(doc(db, "users", uid), {
    stats: nextStats,
    spawned: nextSpawned,
    updatedAt: Date.now()
  });
  await batch.commit();
  return ref.id;
}

export async function updateAssignment(assignmentId, patch) {
  await updateDoc(doc(db, "assignments", assignmentId), patch);
}

export async function deleteAssignment(assignmentId) {
  await deleteDoc(doc(db, "assignments", assignmentId));
}

export async function commitBossDamage(uid, assignmentId, progress, defeated, playerPatch) {
  const batch = writeBatch(db);
  batch.update(doc(db, "assignments", assignmentId), {
    progress,
    status: defeated ? "defeated" : "active"
  });
  batch.update(doc(db, "users", uid), { ...playerPatch, updatedAt: Date.now() });
  await batch.commit();
}

export async function createQuest(uid, title, xpReward) {
  await addDoc(collection(db, "quests"), {
    userId: uid,
    title,
    xpReward,
    date: todayS(),
    done: false,
    createdAt: Date.now()
  });
}

export async function removeQuest(questId) {
  await deleteDoc(doc(db, "quests", questId));
}

export async function completeQuestBatch(uid, questId, playerPatch) {
  const batch = writeBatch(db);
  batch.update(doc(db, "quests", questId), { done: true, date: todayS() });
  batch.update(doc(db, "users", uid), { ...playerPatch, updatedAt: Date.now() });
  await batch.commit();
}

export async function seedDemoBosses(uid, existingTitles, currentStats, currentSpawned) {
  const toAdd = starterDemoBosses(uid).filter((b) => !existingTitles.has(b.title));
  if (!toAdd.length) return 0;

  const batch = writeBatch(db);
  toAdd.forEach((b) => batch.set(doc(collection(db, "assignments")), b));
  batch.update(doc(db, "users", uid), {
    stats: { ...currentStats, total: currentStats.total + toAdd.length },
    spawned: currentSpawned + toAdd.length,
    updatedAt: Date.now()
  });
  await batch.commit();
  return toAdd.length;
}

export async function resetUserWorkspace(user, bosses, quests) {
  const batch = writeBatch(db);
  bosses.forEach((b) => batch.delete(doc(db, "assignments", b.id)));
  quests.forEach((q) => batch.delete(doc(db, "quests", q.id)));
  const fresh = emptyPlayerDoc(user);
  batch.set(doc(db, "users", user.uid), { ...fresh, updatedAt: Date.now() });
  starterQuests(user.uid).forEach((q) => batch.set(doc(collection(db, "quests")), q));
  await batch.commit();
}
