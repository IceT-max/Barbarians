'use strict';

class InputManager {
  constructor() {
    this._keys = new Set();
    this._justPressed = new Set();
    this._justReleased = new Set();

    window.addEventListener('keydown', e => {
      if (!this._keys.has(e.code)) {
        this._keys.add(e.code);
        this._justPressed.add(e.code);
      }
      // Blocca scroll pagina per i tasti di gioco
      if ([
        'ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
        'KeyZ','KeyX','KeyC','KeyV',
        'KeyW','KeyA','KeyS','KeyD',
        'KeyU','KeyI','KeyO','KeyP',
        'Space',
      ].includes(e.code)) e.preventDefault();
    });

    window.addEventListener('keyup', e => {
      this._keys.delete(e.code);
      this._justReleased.add(e.code);
    });
  }

  isDown(code)       { return this._keys.has(code); }
  wasPressed(code)   { return this._justPressed.has(code); }
  wasReleased(code)  { return this._justReleased.has(code); }

  // Da chiamare a fine frame
  flush() {
    this._justPressed.clear();
    this._justReleased.clear();
  }

  // Snapshot di input per un giocatore
  // Restituisce oggetto con i comandi booleani
  snapshotP1() {
    return {
      left:     this.isDown('ArrowLeft'),
      right:    this.isDown('ArrowRight'),
      up:       this.wasPressed('ArrowUp'),
      down:     this.isDown('ArrowDown'),
      slash:    this.wasPressed('KeyZ'),
      overhead: this.wasPressed('KeyX'),
      thrust:   this.wasPressed('KeyC'),
      block:    this.isDown('KeyV'),
    };
  }

  snapshotP2() {
    return {
      left:     this.isDown('KeyA'),
      right:    this.isDown('KeyD'),
      up:       this.wasPressed('KeyW'),
      down:     this.isDown('KeyS'),
      slash:    this.wasPressed('KeyU'),
      overhead: this.wasPressed('KeyI'),
      thrust:   this.wasPressed('KeyO'),
      block:    this.isDown('KeyP'),
    };
  }
}

const INPUT = new InputManager();
