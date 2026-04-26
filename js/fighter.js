'use strict';

// ── Costanti di gioco ────────────────────────────────────
const GROUND_Y    = 400;
const CANVAS_W    = 800;
const GRAVITY     = 0.55;
const JUMP_FORCE  = -12;
const SPEED       = 2.8;
const MAX_HP      = 12;
const SPRITE_W    = 80;
const SPRITE_H    = 120;

// Durate animazioni (in frame a 60fps)
const ANIM_DURATION = {
  idle:     10,
  walk:      7,
  slash:     8,
  overhead:  9,
  thrust:    8,
  block:     1,
  hit:      18,
  jump:      1,
  duck:      1,
  dead:     22,
};

// Hitbox degli attacchi (relativi a fighter.x / fighter.y, facing RIGHT)
const ATTACK_HITBOX = {
  slash:    { dx: SPRITE_W,      dy: SPRITE_H * 0.38, dw: 68, dh: 34 },
  overhead: { dx: SPRITE_W - 10, dy: SPRITE_H * 0.14, dw: 58, dh: 44 },
  thrust:   { dx: SPRITE_W,      dy: SPRITE_H * 0.08, dw: 76, dh: 28 },
};

const ATTACK_DMG = { slash: 1, overhead: 2, thrust: 1 };
const DECAP_THRESHOLD = 4;

class Fighter {
  constructor(id, x, facingRight, isDrax) {
    this.id          = id;
    this.isDrax      = isDrax;
    this.x           = x;
    this.y           = GROUND_Y - SPRITE_H;
    this.vy          = 0;
    this.onGround    = true;
    this.facingRight = facingRight;
    this.hp          = MAX_HP;
    this.alive       = true;
    this.decapitated = false;

    this.state     = 'idle';
    this.frame     = 0;
    this.frameTick = 0;
    this.blocking  = false;

    this.attacking    = false;
    this.attackType   = null;
    this.hitDelivered = false;

    this.hitFlash = 0;

    this.leftBound  = 10;
    this.rightBound = CANVAS_W - SPRITE_W - 10;
  }

  get centerX() { return this.x + SPRITE_W / 2; }

  get bodyBox() {
    return {
      x: this.x + 8,
      y: this.y + SPRITE_H * 0.1,
      w: SPRITE_W - 16,
      h: SPRITE_H * 0.85,
    };
  }

  get headBox() {
    return {
      x: this.x + 6,
      y: this.y,
      w: SPRITE_W - 12,
      h: SPRITE_H * 0.28,
    };
  }

  get weaponBox() {
    if (!this.attacking || this.hitDelivered) return null;
    const def = ATTACK_HITBOX[this.attackType];
    if (!def) return null;
    if (this.frame !== 1) return null;

    const offX = this.facingRight
      ? this.x + def.dx
      : this.x - def.dx - def.dw + SPRITE_W;

    return {
      x: offX,
      y: this.y + def.dy,
      w: def.dw,
      h: def.dh,
    };
  }

  applyInput(cmd) {
    if (!this.alive || this.decapitated) return;

    const busy = this.state === 'hit' || this.state === 'dead';
    if (busy) return;

    const attacking = this.state === 'slash' ||
                      this.state === 'overhead' ||
                      this.state === 'thrust';

    if (cmd.block && !attacking) {
      this.blocking = true;
      this.setState('block');
      return;
    } else {
      this.blocking = false;
    }

    if (!attacking) {
      if (cmd.slash)    { this.startAttack('slash');    return; }
      if (cmd.overhead) { this.startAttack('overhead'); return; }
      if (cmd.thrust)   { this.startAttack('thrust');   return; }
    }

    if (attacking) return;

    if (cmd.up && this.onGround) {
      this.vy = JUMP_FORCE;
      this.onGround = false;
      this.setState('jump');
      SFX.jump();
      return;
    }

    if (cmd.down && this.onGround) {
      this.setState('duck');
      return;
    }

    if (cmd.left && !cmd.down) {
      this.x -= SPEED;
      if (this.x < this.leftBound) this.x = this.leftBound;
      if (this.onGround) this.setState('walk');
    } else if (cmd.right && !cmd.down) {
      this.x += SPEED;
      if (this.x > this.rightBound) this.x = this.rightBound;
      if (this.onGround) this.setState('walk');
    } else if (this.onGround && this.state !== 'duck') {
      this.setState('idle');
    }
  }

  startAttack(type) {
    this.attackType   = type;
    this.attacking    = true;
    this.hitDelivered = false;
    this.setState(type);
    SFX.swing();
  }

  update() {
    if (!this.onGround) {
      this.vy += GRAVITY;
      this.y  += this.vy;
      if (this.y >= GROUND_Y - SPRITE_H) {
        this.y  = GROUND_Y - SPRITE_H;
        this.vy = 0;
        this.onGround = true;
        if (this.state === 'jump') { this.setState('idle'); SFX.land(); }
      }
    }

    if (this.hitFlash > 0) this.hitFlash--;

    this.frameTick++;
    const dur = ANIM_DURATION[this.state] || 10;
    if (this.frameTick >= dur) {
      this.frameTick = 0;
      const frameCount = ANIM_FRAME_COUNT[this.state] || 1;
      this.frame++;
      if (this.frame >= frameCount) {
        this.onAnimEnd();
      }
    }
  }

  onAnimEnd() {
    switch (this.state) {
      case 'slash':
      case 'overhead':
      case 'thrust':
        this.attacking  = false;
        this.attackType = null;
        this.setState('idle');
        break;
      case 'hit':
        this.setState('idle');
        break;
      case 'dead':
        this.frame = (ANIM_FRAME_COUNT.dead || 2) - 1;
        break;
      default:
        this.frame = 0;
    }
  }

  setState(s) {
    if (this.state === s) return;
    if (this.state === 'dead') return;
    this.state     = s;
    this.frame     = 0;
    this.frameTick = 0;
  }

  takeDamage(amount, isDecapitation = false) {
    if (!this.alive || this.decapitated) return;
    if (this.blocking) {
      this.hitFlash = 6;
      SFX.block();
      return;
    }

    this.hp -= amount;
    this.hitFlash = 14;

    if (isDecapitation || this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      if (isDecapitation) {
        this.decapitated = true;
        SFX.decap();
      } else {
        SFX.death();
      }
      this.setState('dead');
    } else {
      SFX.hit();
      this.setState('hit');
    }
  }
}

// Frame count per animazione (usato al posto di SPR[state].length)
const ANIM_FRAME_COUNT = {
  idle:     2,
  walk:     4,
  slash:    3,
  overhead: 3,
  thrust:   3,
  block:    1,
  hit:      1,
  jump:     1,
  duck:     1,
  dead:     2,
};

// Utilità AABB
function rectsOverlap(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}
