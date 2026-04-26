'use strict';

// ── Pixi.js Application ───────────────────────────────────
const app = new PIXI.Application({
  width: 800, height: 500,
  antialias: true,
  backgroundColor: 0x100008,
  resolution: 1,
});
document.getElementById('pixi-container').appendChild(app.view);
app.ticker.maxFPS = 60;

// ── Layer ─────────────────────────────────────────────────
const bgLayer       = new PIXI.Container();
const fightersLayer = new PIXI.Container();
const fxLayer       = new PIXI.Container();
const princessLayer = new PIXI.Container();
app.stage.addChild(bgLayer);
app.stage.addChild(fightersLayer);
app.stage.addChild(fxLayer);
app.stage.addChild(princessLayer);
princessLayer.visible = false;

// Sfondo arena
const arenaGfx = buildArena();
bgLayer.addChild(arenaGfx);

// Effetti
const fxGfx = new PIXI.Graphics();
fxLayer.addChild(fxGfx);

// Goblin
const goblinGfxSrc = buildGoblinGfx();
const goblinContainer = new PIXI.Container();
goblinContainer.addChild(goblinGfxSrc);
goblinContainer.visible = false;
fightersLayer.addChild(goblinContainer);

// Testa rotolante
const rollingHeadGfx = new PIXI.Graphics();
const rollingHeadContainer = new PIXI.Container();
rollingHeadContainer.addChild(rollingHeadGfx);
rollingHeadContainer.visible = false;
rollingHeadContainer.scale.set(1.55);
fxLayer.addChild(rollingHeadContainer);
let rollingHead = null;

// ── Schede HTML ───────────────────────────────────────────
// ── Punteggio ─────────────────────────────────────────────
let currentScore    = 0;
let endLevelReached = 0;

function addScore(pts) {
  currentScore += pts;
  const el = document.getElementById('score-display');
  if (el) el.textContent = String(currentScore).padStart(6, '0');
}

// ── High Score (localStorage) ─────────────────────────────
const HS_KEY = 'barbarians_hiscore';
function hsLoad() {
  try { return JSON.parse(localStorage.getItem(HS_KEY)) || []; } catch { return []; }
}
function hsSave(list) { localStorage.setItem(HS_KEY, JSON.stringify(list.slice(0,10))); }
function hsQualifies(score) {
  if (score <= 0) return false;
  const list = hsLoad();
  return list.length < 10 || score > list[list.length-1].score;
}
function hsInsert(name, score, level) {
  const list = hsLoad();
  list.push({ name: (name||'AAA').slice(0,3).toUpperCase(), score, level });
  list.sort((a,b) => b.score - a.score);
  hsSave(list);
}
function hsRender(hlScore) {
  const tbody = document.getElementById('hiscore-tbody');
  if (!tbody) return;
  const list = hsLoad();
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="hs-empty">NESSUN RECORD</td></tr>'; return;
  }
  let marked = false;
  tbody.innerHTML = list.map((e,i) => {
    let cls = '';
    if (!marked && hlScore !== undefined && e.score === hlScore) { cls = ' class="hs-new"'; marked = true; }
    return `<tr${cls}><td>${i+1}</td><td>${e.name}</td><td>${String(e.score).padStart(7,'0')}</td><td>${e.level}/9</td></tr>`;
  }).join('');
}

// ── Name Entry (stile arcade) ─────────────────────────────
const NE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ ';
let neState = { chars:['A','A','A'], cursor:0, score:0, level:0 };

function showNameEntry(score, level) {
  neState = { chars:['A','A','A'], cursor:0, score, level };
  document.getElementById('ne-score').textContent = 'PUNTEGGIO: ' + String(score).padStart(6,'0');
  document.getElementById('ne-level').textContent = 'LIVELLO RAGGIUNTO: ' + level + '/9';
  neRender();
  gameState = 'nameentry';
  showScreen('nameentry');
}
function neRender() {
  for (let i=0; i<3; i++) {
    const el = document.getElementById('ne-c'+i);
    if (!el) return;
    el.textContent = neState.chars[i];
    el.className = 'ne-char' + (i===neState.cursor ? ' ne-active' : '');
  }
}
function neConfirm() {
  const name = neState.chars.join('');
  hsInsert(name, neState.score, neState.level);
  hsRender(neState.score);
  gameState = 'hiscore';
  showScreen('hiscore');
}

// ── Fine sessione campagna ────────────────────────────────
function endCampaignSession() {
  isCampaign = false;
  princessLayer.removeChildren();
  princessLayer.visible = false;
  fightersLayer.visible = true;
  fxLayer.visible = true;
  if (hsQualifies(currentScore)) {
    showNameEntry(currentScore, endLevelReached);
  } else {
    hsRender();
    gameState = 'hiscore';
    showScreen('hiscore');
  }
}
const msgOverlay   = document.getElementById('message-overlay');
const msgText      = document.getElementById('message-text');

// ── Campagna ──────────────────────────────────────────────
let isCampaign    = false;
let campaignLevel = 1;
const CAMPAIGN_NAMES = ['THOR','MAGNUS','GORAK','SVEN','MORDAK','ZARAK','KROM','VALDOR','DRAX'];

// ── Stato globale ─────────────────────────────────────────
let gameState = 'menu';
let twoPlayer = false;
let round     = 1;
let p1Wins    = 0;
let p2Wins    = 0;
const ROUNDS_TO_WIN = 2;

let p1, p2, ai;
let p1View, p2View;
let effects        = [];
let goblinSeq      = null;
let goblinPalCache = null;

// ── Animazione scena principessa ─────────────────────────
let priAnim         = null;
let priHeroCont     = null, priHeroGfx  = null;
let priMariCont     = null, priMariGfx  = null;
let priGoblinCont   = null;
let priFadeGfx      = null;

// ── Effetti particelle ────────────────────────────────────
function spawnBlood(x, y, count = 6) {
  for (let i = 0; i < count; i++) {
    effects.push({
      type:'blood', x, y,
      vx:(Math.random()-0.5)*6,
      vy:-(Math.random()*5+1),
      life:30+Math.random()*20, maxLife:50,
      size:Math.random()*5+2,
    });
  }
}

function spawnSparks(x, y, count = 5) {
  for (let i = 0; i < count; i++) {
    effects.push({
      type:'spark', x, y,
      vx:(Math.random()-0.5)*7,
      vy:-(Math.random()*4+1),
      life:16, maxLife:16, size:3,
    });
  }
}

function updateEffects() {
  effects = effects.filter(e => e.life > 0);
  for (const e of effects) {
    e.x += e.vx; e.vy += 0.28; e.y += e.vy; e.life--;
  }
}

function drawEffectsFX() {
  fxGfx.clear();
  for (const e of effects) {
    const alpha = e.life / e.maxLife;
    fxGfx.beginFill(
      e.type==='blood' ? (e.life > e.maxLife*0.5 ? 0xCC0000 : 0x660000) : 0xFFEE44,
      alpha
    );
    fxGfx.drawRect(Math.round(e.x), Math.round(e.y), e.size, e.size);
  }
  fxGfx.endFill();
}

// ── HUD ───────────────────────────────────────────────────
function updateHUD() {
  const bar1 = document.getElementById('hp-p1');
  const bar2 = document.getElementById('hp-p2');
  bar1.innerHTML = ''; bar2.innerHTML = '';
  for (let i = 0; i < MAX_HP; i++) {
    const o = document.createElement('div');
    o.className = 'hp-orb' + (i < p1.hp ? '' : ' empty');
    bar1.appendChild(o);
  }
  for (let i = 0; i < MAX_HP; i++) {
    const o = document.createElement('div');
    o.className = 'hp-orb' + (i < p2.hp ? '' : ' empty');
    bar2.appendChild(o);
  }
  document.getElementById('round-num').textContent = round;
}

function updateCampaignHUD() {
  const nameEl  = document.getElementById('hud-p2-name');
  const levelEl = document.getElementById('level-label');
  if (isCampaign) {
    if (nameEl)  nameEl.textContent  = CAMPAIGN_NAMES[campaignLevel - 1] || 'DRAX';
    if (levelEl) levelEl.textContent = 'LV ' + campaignLevel + '/9';
  } else {
    if (nameEl)  nameEl.textContent  = twoPlayer ? 'GIOCATORE 2' : 'DRAX';
    if (levelEl) levelEl.textContent = '';
  }
}

// ── Messaggi ──────────────────────────────────────────────
let msgTimer = 0;
function showMessage(text, duration = 120) {
  msgText.textContent = text;
  msgOverlay.classList.remove('hidden');
  msgTimer = duration;
}
function hideMessage() { msgOverlay.classList.add('hidden'); }

// ── Goblin ────────────────────────────────────────────────
function startGoblinSequence(loser) {
  if (loser === p1) {
    goblinPalCache = PAL_HERO;
  } else {
    goblinPalCache = (isCampaign && campaignLevel <= 8) ? CAMPAIGN_PALS[campaignLevel-1] : PAL_DRAX;
  }
  goblinSeq = {
    phase:0, timer:55,
    goblinX: loser.facingRight ? -50 : 850,
    goblinTargetX: loser.x + SPRITE_W * 0.5,
    loser, isDecap: loser.decapitated,
    carryDir:1, laughed:false,
  };
}

function updateGoblinSequence() {
  if (!goblinSeq) return;
  const s = goblinSeq;
  s.timer--;
  const GSPD = 3.5;

  if (s.phase === 0) {
    if (s.timer <= 0) { s.phase=1; s.timer=220; goblinContainer.visible=true; }

  } else if (s.phase === 1) {
    const dir = s.goblinX < s.goblinTargetX ? 1 : -1;
    s.goblinX += dir * GSPD;
    goblinContainer.x = Math.round(s.goblinX);
    goblinContainer.y = GROUND_Y - 52;
    goblinContainer.scale.x = dir;
    s.carryDir = dir;
    if (Math.abs(s.goblinX - s.goblinTargetX) < 8 || s.timer <= 0) {
      s.phase = s.isDecap ? 2 : 3;
      s.timer = s.isDecap ? 22 : 58;
    }

  } else if (s.phase === 2) {
    if (s.timer === 21) {
      s.loser.headKicked = true;
      const kickDir = -s.carryDir;
      buildRollingHeadGfx(rollingHeadGfx, goblinPalCache);
      rollingHeadContainer.x = s.goblinX + s.carryDir * 26;
      rollingHeadContainer.y = GROUND_Y - 20;
      rollingHeadContainer.rotation = 0;
      rollingHeadContainer.visible = true;
      rollingHead = { x:rollingHeadContainer.x, y:rollingHeadContainer.y,
                      vx:kickDir*11, vy:-9, spin:kickDir*0.22 };
      SFX.hit();
    }
    if (s.timer <= 0) { s.phase=3; s.timer=58; }

  } else if (s.phase === 3) {
    if (!s.laughed) { s.laughed=true; SFX.laugh(); }
    if (s.timer <= 0) { s.phase=4; hideMessage(); }

  } else if (s.phase === 4) {
    s.goblinX += s.carryDir * (GSPD + 1.5);
    goblinContainer.x = Math.round(s.goblinX);
    goblinContainer.scale.x = s.carryDir;
    s.loser.x = s.goblinX - SPRITE_W * 0.5;
    const gone = s.carryDir > 0 ? s.goblinX > 880 : s.goblinX < -80;
    if (gone) { goblinContainer.visible=false; goblinSeq=null; endRound(); }
  }
}

function updateRollingHead() {
  if (!rollingHead) return;
  const h = rollingHead;
  h.vy += 0.52; h.x += h.vx; h.y += h.vy;
  if (h.y >= GROUND_Y - 20) {
    h.y = GROUND_Y - 20;
    h.vy = -Math.abs(h.vy) * 0.42;
    h.vx *= 0.72; h.spin *= 0.62;
    if (Math.abs(h.vy) < 0.8) h.vy = 0;
  }
  rollingHeadContainer.x = Math.round(h.x);
  rollingHeadContainer.y = Math.round(h.y);
  rollingHeadContainer.rotation += h.spin;
  if (h.x < -70 || h.x > 870) { rollingHeadContainer.visible=false; rollingHead=null; }
}

// ── Collisioni ────────────────────────────────────────────
function checkAttacks() { checkHit(p1,p2); checkHit(p2,p1); }

function checkHit(attacker, defender) {
  if (attacker.hitDelivered) return;
  const wBox = attacker.weaponBox;
  if (!wBox) return;
  const isThrust = attacker.attackType === 'thrust';
  const headHit  = isThrust && rectsOverlap(wBox, defender.headBox);
  const bodyHit  = rectsOverlap(wBox, defender.bodyBox);
  if (!bodyHit && !headHit) return;
  attacker.hitDelivered = true;
  const hitX = wBox.x + wBox.w/2, hitY = wBox.y + wBox.h/2;
  const canDecap = isThrust && defender.hp <= DECAP_THRESHOLD;
  const dmg = ATTACK_DMG[attacker.attackType] || 1;
  if (defender.blocking) { spawnSparks(hitX, hitY); }
  else {
    spawnBlood(hitX, hitY, canDecap ? 16 : 6);
    if (isCampaign && attacker === p1) addScore(canDecap ? 500 : 100);
  }
  defender.takeDamage(dmg, canDecap);
}

// ── Orientamento ──────────────────────────────────────────
function updateFacing() {
  if (p1.alive && p2.alive) {
    p1.facingRight = p1.centerX < p2.centerX;
    p2.facingRight = p2.centerX < p1.centerX;
  }
}

// ── Gestione round ────────────────────────────────────────
let roundOverTimer = 0;
let roundOverPhase = 'none';

function checkRoundEnd() {
  if (roundOverPhase !== 'none') return;
  if (p1.alive && p2.alive) return;
  roundOverPhase = 'message';
  roundOverTimer = 90;

  const oppName = isCampaign ? CAMPAIGN_NAMES[campaignLevel-1] : 'DRAX';
  if (!p1.alive && !p2.alive) {
    showMessage('PAREGGIO!');
  } else if (!p1.alive) {
    p2Wins++;
    showMessage(twoPlayer ? 'GIOCATORE 2 VINCE!' : oppName + ' VINCE!');
    SFX.victory();
    startGoblinSequence(p1);
  } else {
    p1Wins++;
    showMessage('GIOCATORE 1 VINCE!');
    SFX.victory();
    startGoblinSequence(p2);
  }
}

function endRound() {
  hideMessage();
  roundOverPhase = 'done';
  if (p1Wins >= ROUNDS_TO_WIN || p2Wins >= ROUNDS_TO_WIN) {
    showResultScreen(p1Wins >= ROUNDS_TO_WIN);
    return;
  }
  round++;
  setTimeout(startRound, 500);
}

function updateRoundOver() {
  if (roundOverPhase !== 'message') return;
  roundOverTimer--;
  if (roundOverTimer <= 0 && !goblinSeq) {
    roundOverPhase = 'waiting';
    hideMessage();
    setTimeout(endRound, 800);
  }
}

// ── Avvio round ───────────────────────────────────────────
function startRound() {
  effects = []; goblinSeq = null; rollingHead = null;
  goblinContainer.visible = false;
  rollingHeadContainer.visible = false;
  rollingHeadGfx.clear();
  roundOverPhase = 'none';

  p1 = new Fighter(1, 100, true,  false);
  p2 = new Fighter(2, 560, false, true);

  if (p1View) fightersLayer.removeChild(p1View.container);
  if (p2View) fightersLayer.removeChild(p2View.container);

  const p2Pal = (isCampaign && campaignLevel <= 8) ? CAMPAIGN_PALS[campaignLevel-1] : PAL_DRAX;
  p1View = new FighterView(PAL_HERO);
  p2View = new FighterView(p2Pal);
  fightersLayer.addChild(p1View.container);
  fightersLayer.addChild(p2View.container);

  fightersLayer.removeChild(goblinContainer);
  fightersLayer.addChild(goblinContainer);

  if (!twoPlayer) {
    const diff = isCampaign ? (campaignLevel - 1) : 4;
    ai = new AIController(p2, p1, diff);
  } else {
    ai = null;
  }

  updateHUD();
  updateCampaignHUD();
  const msg = isCampaign ? 'LIVELLO ' + campaignLevel : 'ROUND ' + round;
  showMessage(msg, 80);
  SFX.roundStart();
}

// ── Game Loop ─────────────────────────────────────────────
app.ticker.add(() => {
  if (gameState === 'princess') { updatePrincessAnim(); return; }
  if (gameState !== 'playing') return;
  if (msgTimer > 0) {
    msgTimer--;
    if (msgTimer <= 0 && roundOverPhase === 'none') hideMessage();
  }
  const cmd1 = INPUT.snapshotP1();
  const cmd2 = twoPlayer ? INPUT.snapshotP2() : (ai ? ai.update() : {});
  p1.applyInput(cmd1); p2.applyInput(cmd2);
  p1.update(); p2.update();
  updateFacing(); checkAttacks(); updateEffects();
  checkRoundEnd(); updateRoundOver();
  updateGoblinSequence(); updateRollingHead();
  updateHUD();
  INPUT.flush();
  p1View.update(p1); p2View.update(p2);
  drawEffectsFX();
});

// ── Schermate ─────────────────────────────────────────────
function showScreen(name) {
  ['menu','game','result','hiscore','nameentry'].forEach(id => {
    document.getElementById(id+'-screen').classList.add('hidden');
  });
  document.getElementById(name+'-screen').classList.remove('hidden');
}

function startGame(twoP) {
  twoPlayer  = twoP;
  isCampaign = !twoP;
  campaignLevel = 1;
  currentScore = 0; addScore(0);
  round = 1; p1Wins = 0; p2Wins = 0;
  showScreen('game');
  gameState = 'playing';
  startRound();
}

function showResultScreen(p1Won) {
  // Campagna: vittoria → avanza livello o principessa; sconfitta → Mariana in prigione
  if (isCampaign) {
    if (p1Won) {
      if (campaignLevel >= 9) {
        showPrincessScreen();
      } else {
        campaignLevel++;
        round = 1; p1Wins = 0; p2Wins = 0;
        updateCampaignHUD();
        showMessage('LIVELLO ' + campaignLevel + ' - ' + CAMPAIGN_NAMES[campaignLevel-1], 110);
        setTimeout(startRound, 2200);
      }
    } else {
      showPrisonerScreen();
    }
    return;
  }
  // Schermata risultato (solo 2 giocatori)
  gameState = 'gameover';
  showScreen('result');
  const oppName = twoPlayer ? 'GIOCATORE 2' : 'DRAX';
  document.getElementById('result-title').textContent = p1Won ? 'VITTORIA!' : 'SCONFITTA';
  document.getElementById('result-sub').textContent = p1Won
    ? (twoPlayer ? 'GIOCATORE 1 TRIONFA' : 'HAI SCONFITTO ' + oppName + '!')
    : (twoPlayer ? 'GIOCATORE 2 TRIONFA' : oppName + ' HA VINTO');
}

function showPrisonerScreen() {
  endLevelReached = campaignLevel;
  gameState = 'princess';
  SFX.stopMusic();
  princessLayer.removeChildren();
  priHeroCont = null; priHeroGfx = null;
  priMariCont = null; priMariGfx = null;
  priGoblinCont = null;

  const sceneGfx = new PIXI.Graphics();
  try { buildPrisonerScene(sceneGfx); } catch(e) { console.error('prisonerScene:', e); }
  princessLayer.addChild(sceneGfx);

  priFadeGfx = new PIXI.Graphics();
  princessLayer.addChild(priFadeGfx);

  priAnim = { phase: 'prisoner-wait', timer: 210 };

  princessLayer.visible = true;
  fightersLayer.visible = false;
  fxLayer.visible = false;
}

function showPrincessScreen() {
  endLevelReached = 9;
  gameState = 'princess';
  SFX.stopMusic();

  // Pulisce layer
  princessLayer.removeChildren();
  priHeroCont = null; priHeroGfx = null;
  priMariCont = null; priMariGfx = null;

  // Sfondo dungeon statico
  const bgGfx = new PIXI.Graphics();
  try { buildDungeonBg(bgGfx); } catch(e) { console.error('dungeonBg:', e); }
  princessLayer.addChild(bgGfx);

  // Container eroe (scala CHAR_SCALE, piedi a GROUND_Y)
  const baseY = GROUND_Y - SPRITE_H * CHAR_SCALE;
  const halfW = 40 * CHAR_SCALE;

  priHeroCont = new PIXI.Container();
  priHeroCont.scale.set(CHAR_SCALE);
  priHeroCont.y = baseY;
  priHeroGfx = new PIXI.Graphics();
  priHeroCont.addChild(priHeroGfx);
  princessLayer.addChild(priHeroCont);

  // Container Mariana
  priMariCont = new PIXI.Container();
  priMariCont.scale.set(CHAR_SCALE);
  priMariCont.y = baseY;
  priMariGfx = new PIXI.Graphics();
  priMariCont.addChild(priMariGfx);
  princessLayer.addChild(priMariCont);

  // Posizioni iniziali: eroe fuori schermo a sinistra, Mariana al centro
  priAnim = { phase:'enter', heroX:-110, mariX:420, timer:0,
              walkF:0, walkT:0, mariWalkF:0, mariWalkT:0 };
  priHeroCont.x = priAnim.heroX - halfW;
  priMariCont.x = priAnim.mariX - halfW;

  // Goblin (nascosto finché non serve)
  priGoblinCont = new PIXI.Container();
  priGoblinCont.addChild(buildGoblinGfx());
  priGoblinCont.scale.x = 1;
  priGoblinCont.y = GROUND_Y - 52;
  priGoblinCont.x = -80;
  priGoblinCont.visible = false;
  princessLayer.addChild(priGoblinCont);

  // Overlay dissolvenza finale
  priFadeGfx = new PIXI.Graphics();
  princessLayer.addChild(priFadeGfx);

  // Disegno iniziale
  try { drawCinemaHero(priHeroGfx, 0, PAL_HERO); } catch(e) {}
  try { drawCinemaMari(priMariGfx, 0, false); } catch(e) {}

  princessLayer.visible = true;
  fightersLayer.visible = false;
  fxLayer.visible       = false;
}

function updatePrincessAnim() {
  if (!priAnim) return;
  const a = priAnim;
  const halfW = 40 * CHAR_SCALE;

  // Avanza walk frame eroe
  a.walkT++;
  if (a.walkT >= 8) { a.walkT = 0; a.walkF = (a.walkF+1) % 4; }
  const heroWalkTick = (a.walkT === 0);

  let redrawHero = heroWalkTick;
  let redrawMari = false;

  switch (a.phase) {
    case 'enter':
      a.heroX = Math.min(a.heroX + 3.5, 295);
      priHeroCont.x = a.heroX - halfW;
      if (a.heroX >= 295) {
        a.phase = 'reach'; a.timer = 55;
        redrawHero = true; redrawMari = true;
      }
      break;

    case 'reach':
      if (--a.timer <= 0) { a.phase = 'hold'; a.timer = 40; }
      break;

    case 'hold':
      if (--a.timer <= 0) { a.phase = 'exit'; redrawHero = true; redrawMari = true; }
      break;

    case 'exit':
      a.heroX += 4; a.mariX += 4;
      priHeroCont.x = a.heroX - halfW;
      priMariCont.x = a.mariX - halfW;
      a.mariWalkT++;
      if (a.mariWalkT >= 8) { a.mariWalkT=0; a.mariWalkF=(a.mariWalkF+1)%4; redrawMari=true; }
      if (a.heroX > 900) {
        a.phase = 'goblin-enter'; a.goblinX = -80;
        priGoblinCont.visible = true;
      }
      break;

    case 'goblin-enter':
      a.goblinX += 2.8;
      priGoblinCont.x = a.goblinX;
      if (a.goblinX >= 360) {
        a.phase = 'goblin-laugh'; a.timer = 18;
      }
      break;

    case 'goblin-laugh':
      if (--a.timer <= 0) {
        SFX.laugh();
        a.phase = 'goblin-fade'; a.timer = 110;
      }
      break;

    case 'goblin-fade': {
      a.timer--;
      const fa = Math.min(1, 1 - a.timer / 110);
      priFadeGfx.clear();
      priFadeGfx.beginFill(0x000000, fa);
      priFadeGfx.drawRect(0, 0, 800, 500);
      if (a.timer <= 0) {
        priAnim = null;
        setTimeout(endCampaignSession, 400);
      }
      break;
    }

    case 'prisoner-wait':
      if (--a.timer <= 0) { a.phase = 'prisoner-fade'; a.timer = 100; }
      break;

    case 'prisoner-fade': {
      a.timer--;
      const fa = Math.min(1, 1 - a.timer / 100);
      priFadeGfx.clear();
      priFadeGfx.beginFill(0x000000, fa);
      priFadeGfx.drawRect(0, 0, 800, 500);
      if (a.timer <= 0) {
        priAnim = null;
        setTimeout(endCampaignSession, 400);
      }
      break;
    }
  }

  if (!priAnim) return; // fase done

  if (redrawHero) {
    priHeroGfx.clear();
    try {
      if (a.phase === 'reach' || a.phase === 'hold') drawCinemaHeroReach(priHeroGfx, PAL_HERO);
      else                                            drawCinemaHero(priHeroGfx, a.walkF, PAL_HERO);
    } catch(e) {}
  }

  if (redrawMari) {
    priMariGfx.clear();
    const hold = (a.phase === 'reach' || a.phase === 'hold' || a.phase === 'exit');
    const mf   = (a.phase === 'exit') ? a.mariWalkF : 0;
    try { drawCinemaMari(priMariGfx, mf, hold); } catch(e) {}
  }
}

// ── Pulsanti e tastiera ───────────────────────────────────
document.addEventListener('keydown', e => {
  // Name entry: navigazione stile arcade
  if (gameState === 'nameentry') {
    const n = neState;
    if (e.key === 'ArrowUp') {
      const i = NE_CHARS.indexOf(n.chars[n.cursor]);
      n.chars[n.cursor] = NE_CHARS[(i+1) % NE_CHARS.length];
      neRender(); e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      const i = NE_CHARS.indexOf(n.chars[n.cursor]);
      n.chars[n.cursor] = NE_CHARS[(i-1+NE_CHARS.length) % NE_CHARS.length];
      neRender(); e.preventDefault();
    } else if (e.key === 'ArrowRight') {
      n.cursor = Math.min(2, n.cursor+1); neRender(); e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      n.cursor = Math.max(0, n.cursor-1); neRender(); e.preventDefault();
    } else if (e.key === 'Enter') {
      neConfirm();
    } else if (e.key.length === 1 && /[A-Za-z ]/.test(e.key)) {
      n.chars[n.cursor] = e.key.toUpperCase();
      n.cursor = Math.min(2, n.cursor+1);
      neRender();
    }
  }
});

document.getElementById('btn-1p').addEventListener('click', () => {
  SFX.resume(); SFX.startMusic(); startGame(false);
});
document.getElementById('btn-2p').addEventListener('click', () => {
  SFX.resume(); SFX.startMusic(); startGame(true);
});
document.getElementById('btn-hiscore').addEventListener('click', () => {
  hsRender(); gameState = 'hiscore'; showScreen('hiscore');
});
document.getElementById('btn-again').addEventListener('click', () => {
  showScreen('game');
  round = 1; p1Wins = 0; p2Wins = 0;
  gameState = 'playing';
  SFX.startMusic();
  startRound();
});
document.getElementById('btn-to-menu').addEventListener('click', () => {
  SFX.stopMusic(); isCampaign = false;
  gameState = 'menu'; showScreen('menu');
});
document.getElementById('btn-princess-menu').addEventListener('click', () => {
  priAnim = null;
  princessLayer.removeChildren();
  princessLayer.visible = false;
  fightersLayer.visible = true;
  fxLayer.visible       = true;
  document.getElementById('princess-overlay').classList.add('hidden');
  isCampaign = false;
  gameState = 'menu'; showScreen('menu');
});

// Hiscore screen
document.getElementById('btn-hs-menu').addEventListener('click', () => {
  gameState = 'menu'; showScreen('menu');
});
document.getElementById('btn-hs-reset').addEventListener('click', () => {
  document.getElementById('reset-modal').classList.remove('hidden');
});
document.getElementById('btn-reset-yes').addEventListener('click', () => {
  hsSave([]);
  hsRender();
  document.getElementById('reset-modal').classList.add('hidden');
});
document.getElementById('btn-reset-no').addEventListener('click', () => {
  document.getElementById('reset-modal').classList.add('hidden');
});

// Name entry confirm button
document.getElementById('btn-ne-confirm').addEventListener('click', neConfirm);
