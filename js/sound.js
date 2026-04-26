'use strict';

// ── Sintetizzatore ZzFX-compatibile (custom, MIT) ────────
// API: zzfx(vol, rand, freq, atk, sus, rel, shape, curve, slide, dSlide, pJump, pJumpT, rep, noise)
// shape: 0=sine 1=square 2=saw 3=triangle
// slide: semitoni/sec×500 (valore 1 → +500 Hz/sec)

const zzfxR = 44100;
zzfx.x = new (window.AudioContext || window.webkitAudioContext)();

function zzfxG(
  vol=1, rand=.05, freq=220,
  atk=0, sus=0, rel=.1,
  shape=0, curve=1,
  slide=0, dSlide=0,
  pJump=0, pJumpT=0,
  rep=0, noise=0
) {
  const B = zzfxR, PI2 = Math.PI * 2;

  // Randomizzazione pitch
  freq *= 1 + rand * (Math.random() * 2 - 1);

  // Conversione in freq angolare per campione
  let f = freq * PI2 / B;
  let slidePS  = slide  * 500 * PI2 / B / B;
  const dSlidePS = dSlide * 500 * PI2 / B / B;

  const atkS = atk * B + 9 | 0;
  const susS = sus * B     | 0;
  const relS = rel * B + 9 | 0;
  const total = atkS + susS + relS;

  const buf = new Float32Array(total);
  let phase = 0;

  for (let i = 0; i < total; i++) {
    // Slide con accelerazione
    slidePS += dSlidePS;
    f += slidePS;

    // Oscillatore
    phase += f;
    const cyc = (phase / PI2) % 1;
    let osc;
    if      (shape === 1) osc = cyc > .5 ? 1 : -1;
    else if (shape === 2) osc = cyc * 2 - 1;
    else if (shape === 3) osc = Math.abs(cyc * 2 - 1) * 2 - 1;
    else                  osc = Math.sin(phase);

    // Mix noise
    if (noise) osc = osc * (1 - noise) + (Math.random() * 2 - 1) * noise;

    // Inviluppo ADSR semplificato
    let env;
    if      (i < atkS)           env = i / atkS;
    else if (i < atkS + susS)    env = 1;
    else                         env = 1 - (i - atkS - susS) / relS;
    env = Math.max(0, Math.min(1, env));

    buf[i] = Math.max(-1, Math.min(1, osc * env * vol * .5));
  }
  return buf;
}

function zzfxP(buf, ctx = zzfx.x, dest = ctx.destination) {
  const node = ctx.createBufferSource();
  const ab   = ctx.createBuffer(1, buf.length, zzfxR);
  ab.getChannelData(0).set(buf);
  node.buffer = ab;
  node.connect(dest);
  node.start();
  return node;
}

function zzfx(...t) { return zzfxP(zzfxG(...t)); }

// ── Player ZzFXM (mini) ───────────────────────────────────
// song = [instruments, patterns, sequence, bpm]
// instruments: array di param zzfxG (base freq=440 verrà sovrascritta)
// pattern[c][step*2]   = period (0=pausa, >=1 → freq = 440*2^((period-33)/12))
// pattern[c][step*2+1] = attenuazione 0-7

function _zzfxmSchedule(song, gainNode) {
  const [instruments, patterns, sequence, bpm = 125] = song;
  const ctx  = zzfx.x;
  const dest = gainNode || ctx.destination;
  const stepLen = 60 / bpm / 4; // durata di una semicroma in secondi
  let time = ctx.currentTime + 0.05;

  for (const pi of sequence) {
    const pat   = patterns[pi];
    const nStep = pat[0].length >> 1;

    for (let s = 0; s < nStep; s++) {
      for (let c = 0; c < pat.length; c++) {
        const period = pat[c][s * 2];
        if (!period) continue;

        const atten = pat[c][s * 2 + 1] || 0;
        const inst  = instruments[c].slice();
        inst[2] = 440 * Math.pow(2, (period - 33) / 12); // override freq
        inst[0] = (inst[0] || 1) * (1 - atten / 8);      // attenuazione

        const raw = zzfxG(...inst);
        const ab  = ctx.createBuffer(1, raw.length, zzfxR);
        ab.getChannelData(0).set(raw);
        const src = ctx.createBufferSource();
        src.buffer = ab;
        src.connect(dest);
        const t = time + s * stepLen;
        if (t > ctx.currentTime) src.start(t);
      }
    }
    time += nStep * stepLen;
  }
  return time;
}

// ── Canzone di sottofondo (dark fantasy, 138 BPM) ─────────
// Melodia ispirata all'originale Tone.js:
//   E4(28) G4(31) A4(33) B4(35) D5(38) B4 A4 G4 | E4 G4 A4 G4 E4 D4(26) E4 -
// Periodi → freq: periodo 33 = 440 Hz (A4), formula standard MIDI
const SONG = [
  [ // Strumenti
    // 0: Melodia (onda quadra, breve)
    [0.13, 0, 440, 0, 0, 0.09, 1, 1.5],
    // 1: Armonia (onda quadra, più bassa)
    [0.13, 0, 440, 0, 0, 0.07, 1, 1],
    // 2: Basso (dente di sega, tenuto)
    [0.38, 0, 440, 0, 0.05, 0.28, 2, 1],
    // 3: Kick (seno, caduta rapida di intonazione)
    [0.85, 0, 440, 0, 0, 0.10, 0, 1, -2],
    // 4: Rullante (rumoroso)
    [0.38, 0.2, 440, 0, 0, 0.08, 0, 1, 0, 0, 0, 0, 0, 0.7],
    // 5: Hi-hat (rumore puro, brevissimo)
    [0.13, 0.1, 440, 0, 0, 0.02, 0, 1, 0, 0, 0, 0, 0, 1],
  ],
  [ // Pattern 0: loop principale — 16 step (32 valori per canale)
    [
      // 0: Melodia
      [28,0, 31,0, 33,0, 35,0, 38,0, 35,0, 33,0, 31,0,
       28,0, 31,0, 33,0, 31,0, 28,0, 26,0, 28,0,  0,0],
      // 1: Armonia
      [24,0, 28,0, 30,0, 31,0, 35,0, 31,0, 30,0, 28,0,
       24,0, 28,0, 30,0, 28,0, 24,0, 23,0, 24,0,  0,0],
      // 2: Basso (ogni due step)
      [ 4,0,  0,0,  9,0,  0,0,  4,0,  0,0,  2,0,  0,0,
        4,0,  0,0,  7,0,  0,0,  4,0,  0,0, 11,0,  0,0],
      // 3: Kick — beat 0 e 8 (period 14 ≈ 165 Hz)
      [14,0,  0,0,  0,0,  0,0,  0,0,  0,0,  0,0,  0,0,
       14,0,  0,0,  0,0,  0,0,  0,0,  0,0,  0,0,  0,0],
      // 4: Rullante — beat 4 e 12 (period 21 ≈ 220 Hz)
      [ 0,0,  0,0,  0,0,  0,0, 21,0,  0,0,  0,0,  0,0,
        0,0,  0,0,  0,0,  0,0, 21,0,  0,0,  0,0,  0,0],
      // 5: Hi-hat — step dispari (period 45 ≈ 880 Hz)
      [ 0,0, 45,0,  0,0, 45,0,  0,0, 45,0,  0,0, 45,0,
        0,0, 45,0,  0,0, 45,0,  0,0, 45,0,  0,0, 45,0],
    ]
  ],
  [0, 0, 0, 0, 0, 0, 0, 0], // sequenza: 8 ripetizioni del pattern 0
  138                         // BPM
];

// ── SoundEngine ───────────────────────────────────────────
class SoundEngine {
  constructor() {
    this._musicGain  = null;
    this._musicTimer = null;
    this._createGain();
  }

  _createGain() {
    try {
      this._musicGain = zzfx.x.createGain();
      this._musicGain.gain.value = 0.13;
      this._musicGain.connect(zzfx.x.destination);
    } catch (_) {}
  }

  // Sblocca AudioContext al primo gesto utente
  resume() {
    if (zzfx.x && zzfx.x.state !== 'running') zzfx.x.resume();
  }

  // ── Effetti sonori ────────────────────────────────────
  swing() {
    // Fendente: dente di sega con discesa di intonazione e rumore
    zzfx(0.42, 0.1, 500, 0, 0, 0.20, 2, 1, -1.0, 0, 0, 0, 0, 0.45);
  }

  hit() {
    const a = new Audio('sfx/colpo.mp3');
    a.play().catch(() => {});
  }

  block() {
    // Parata: triangolo metallico con vibrato in discesa
    zzfx(0.40, 0, 900, 0, 0.01, 0.13, 3, 1, 0.6, -0.8);
  }

  jump() {
    // Salto: onda quadra ascendente
    zzfx(0.28, 0, 200, 0, 0.05, 0.10, 1, 2, 2.0);
  }

  land() {
    // Atterraggio: tonfo con rumore
    zzfx(0.60, 0.3, 80, 0, 0, 0.09, 0, 1, -0.5, 0, 0, 0, 0, 0.55);
  }

  death() {
    // Morte: dente di sega discendente lungo
    zzfx(0.90, 0.1, 130, 0.01, 0.20, 1.60, 2, 1, -0.45);
  }

  decap() {
    const a = new Audio('sfx/testa.mp3');
    a.play().catch(() => {});
  }

  roundStart() {
    // Fanfara di round: due beep quadri in salita
    zzfx(0.48, 0, 440, 0, 0, 0.12, 1, 1.5);
    setTimeout(() => zzfx(0.48, 0, 660, 0, 0, 0.12, 1, 1.5), 145);
  }

  victory() {
    // Vittoria: melodia a sei note
    const notes = [330, 392, 440, 523, 392, 523];
    notes.forEach((fr, i) =>
      setTimeout(() => zzfx(0.48, 0, fr, 0, 0.01, 0.10, 1, 1.5), i * 115)
    );
  }

  laugh() {
    const a = new Audio('sfx/risata.mp3');
    a.play().catch(() => {});
  }

  // ── Musica di sottofondo ──────────────────────────────
  startMusic() {
    if (this._musicTimer !== null) return;
    if (!this._musicGain) this._createGain();
    this._musicGain.gain.setTargetAtTime(0.13, zzfx.x.currentTime, 0.05);
    this._scheduleLoop();
  }

  _scheduleLoop() {
    const endTime = _zzfxmSchedule(SONG, this._musicGain);
    const ctx = zzfx.x;
    const wait = (endTime - ctx.currentTime - 0.18) * 1000;
    this._musicTimer = setTimeout(() => {
      this._musicTimer = null;
      this._scheduleLoop();
    }, Math.max(wait, 60));
  }

  stopMusic() {
    if (this._musicTimer !== null) {
      clearTimeout(this._musicTimer);
      this._musicTimer = null;
    }
    if (this._musicGain) {
      this._musicGain.gain.setTargetAtTime(0, zzfx.x.currentTime, 0.15);
    }
  }
}

const SFX = new SoundEngine();
