// Web Audio API orqali generatsiya qilingan qisqa quvnoq ohang.
// Tashqi audio fayl kerak emas, brauzerning o'zida yaratiladi.
//
// MUHIM: brauzerlar yangi AudioContext'ni odatda "suspended" (to'xtatilgan)
// holatda boshlaydi, avtoplay siyosati tufayli — uni "resume" qilmasdan
// ovoz chalinmaydi (hech qanday xato ham chiqmaydi, shunchaki jimlik).
// Shuning uchun: (1) bitta umumiy context saqlaymiz, (2) foydalanuvchi
// sahifada istalgan joyni bosganda/tugma bosganda uni avtomatik
// "resume" qilamiz, (3) har chaqiruvda ham qo'shimcha urinib ko'ramiz.

let sharedCtx = null;
let unlockersAttached = false;

function getContext() {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedCtx) {
    sharedCtx = new AudioCtx();
  }

  if (!unlockersAttached) {
    unlockersAttached = true;
    const unlock = () => {
      if (sharedCtx && sharedCtx.state === "suspended") {
        sharedCtx.resume().catch(() => {});
      }
    };
    ["click", "keydown", "touchstart", "mousedown"].forEach((ev) =>
      document.addEventListener(ev, unlock, { passive: true })
    );
  }

  return sharedCtx;
}

function scheduleNotes(ctx) {
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 — quvnoq arpeggio
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = ctx.currentTime + i * 0.09;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.25, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.4);
  });
}

export function playChime() {
  try {
    const ctx = getContext();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume().then(() => scheduleNotes(ctx)).catch(() => {});
    } else {
      scheduleNotes(ctx);
    }
  } catch {
    // Ovoz ijro etilmasa ham ilova ishlashda davom etadi
  }
}
