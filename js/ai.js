'use strict';

class AIController {
  constructor(fighter, target, difficulty = 0) {
    this.f          = fighter;
    this.target     = target;
    this.action     = null;
    this.thinkCD    = 0;
    this.difficulty = Math.max(0, Math.min(8, difficulty));
  }

  update() {
    this.thinkCD--;
    if (this.thinkCD > 0) return this._currentCmd();
    // Velocità di reazione: difficulty 0 → lento, difficulty 8 → veloce
    const base = Math.max(8, 38 - this.difficulty * 3.5) | 0;
    const rnd  = Math.max(4, 18 - this.difficulty * 1.5) | 0;
    this.thinkCD = base + Math.floor(Math.random() * rnd);
    this._decide();
    return this._currentCmd();
  }

  _decide() {
    const f = this.f, t = this.target, d = this.difficulty;
    if (!f.alive || f.state === 'dead') return;
    if (!t.alive) { this.action = 'idle'; return; }

    const dx     = t.centerX - f.centerX;
    const dist   = Math.abs(dx);
    const facing = f.facingRight ? (dx > 0) : (dx < 0);

    const attackRange = SPRITE_W + 50 + d * 3;
    const closeRange  = SPRITE_W + 18;
    const roll = Math.random();

    // Aggressività e probabilità di parata scalano con il livello
    const aggression  = Math.min(0.82, 0.35 + d * 0.06);
    const blockChance = Math.max(0.05, 0.20 - d * 0.015);

    if (dist > attackRange) {
      this.action = dx > 0 ? 'moveRight' : 'moveLeft';
    } else if (dist < closeRange) {
      if      (roll < 0.22)              this.action = dx > 0 ? 'moveLeft' : 'moveRight';
      else if (roll < 0.22 + blockChance) this.action = 'block';
      else                                this.action = this._pickAttack(d);
    } else {
      if (!facing) {
        this.action = dx > 0 ? 'moveRight' : 'moveLeft';
      } else if (roll < blockChance)             this.action = 'block';
      else if (roll < blockChance + 0.07)        this.action = 'jump';
      else if (roll < blockChance + 0.07 + aggression) this.action = this._pickAttack(d);
      else this.action = dx > 0 ? 'moveRight' : 'moveLeft';
    }
  }

  _pickAttack(d = 0) {
    const r = Math.random();
    const thrustProb = 0.08 + d * 0.04; // più thrust ai livelli alti (pericoloso)
    if (r < 0.42)               return 'slash';
    if (r < 0.65)               return 'overhead';
    if (r < 0.65 + thrustProb)  return 'thrust';
    return 'slash';
  }

  _currentCmd() {
    const cmd = {
      left:false, right:false, up:false, down:false,
      slash:false, overhead:false, thrust:false, block:false,
    };
    switch (this.action) {
      case 'moveLeft':  cmd.left     = true; break;
      case 'moveRight': cmd.right    = true; break;
      case 'jump':      cmd.up       = true; break;
      case 'slash':     cmd.slash    = true; break;
      case 'overhead':  cmd.overhead = true; break;
      case 'thrust':    cmd.thrust   = true; break;
      case 'block':     cmd.block    = true; break;
    }
    return cmd;
  }
}
