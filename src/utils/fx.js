let audioCtx = null;

export function playBeep(freq = 520, dur = 0.12, enabled = true) {
  if (!enabled) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = freq;
    osc.type = "triangle";
    gain.gain.value = 0.06;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    osc.stop(audioCtx.currentTime + dur);
  } catch {
    // Ignore WebAudio restrictions
  }
}

export function spawnFloatText(text, extraClass = "") {
  const el = document.createElement("div");
  el.className = "ft " + extraClass;
  el.textContent = text;
  document.body.append(el);
  setTimeout(() => el.remove(), 1500);
}

export function spawnDamageNumber(cardEl, text) {
  if (!cardEl) return;
  const r = cardEl.getBoundingClientRect();
  const el = document.createElement("div");
  el.className = "ft cr";
  el.textContent = text;
  el.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top + r.height / 3}px;font-size:30px`;
  document.body.append(el);
  setTimeout(() => el.remove(), 1500);
}

export function triggerHitFx(bossId, dmg) {
  const card = document.querySelector(`.boss[data-id="${CSS.escape(bossId)}"]`);
  if (card) {
    card.classList.add("hit");
    spawnDamageNumber(card, `-${dmg} HP`);
    setTimeout(() => card.classList.remove("hit"), 700);
  }
  document.body.classList.add("shake");
  setTimeout(() => document.body.classList.remove("shake"), 500);
}

export function spawnShockwaveRings(enabled = true) {
  if (!enabled) return;
  for (let i = 0; i < 3; i++) {
    const el = document.createElement("div");
    el.className = "rw";
    el.style.animationDelay = `${i * 0.18}s`;
    document.body.append(el);
    setTimeout(() => el.remove(), 1600);
  }
}

export function triggerConfettiBurst(
  canvasEl,
  bx = window.innerWidth / 2,
  by = window.innerHeight / 2,
  cnt = 140,
  enabled = true
) {
  if (!canvasEl || !enabled) return;
  const c = canvasEl.getContext("2d");
  canvasEl.width = window.innerWidth;
  canvasEl.height = window.innerHeight;
  const cols = ["#8b5cf6", "#3b82f6", "#22d3ee", "#fb923c", "#fff"];
  const ps = Array.from({ length: cnt }, () => ({
    x: bx,
    y: by,
    vx: (Math.random() - 0.5) * 18,
    vy: Math.random() * -16 - 3,
    s: 4 + Math.random() * 6,
    c: cols[(Math.random() * 5) | 0],
    r: Math.random() * 6
  }));
  let n = 0;
  function tick() {
    c.clearRect(0, 0, canvasEl.width, canvasEl.height);
    ps.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.45;
      p.r += 0.2;
      c.fillStyle = p.c;
      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.r);
      c.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
      c.restore();
    });
    if (++n < 130) requestAnimationFrame(tick);
    else c.clearRect(0, 0, canvasEl.width, canvasEl.height);
  }
  requestAnimationFrame(tick);
}
