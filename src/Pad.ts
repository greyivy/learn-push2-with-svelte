import { Readable, writable, Writable } from 'svelte/store'
import { getColorVelocity, PadColor } from './PadColor'
import type { Controller } from './Controller'
import type { Direction, Note, PitchCoordinates } from '@tonaljs/core'
import type { Chord } from "@tonaljs/chord";

const DEFAULT_PRESSED_COLOR = 'RED'
const DEFAULT_HIGHLIGHTED_COLOR = 'GREEN'

const DEFAULT_ROOT_COLOR = 'BLUE'
const DEFAULT_SCALE_COLOR = 'YELLOW'

export interface PadNote extends Note {
  isRoot: boolean
  isScale: boolean,
  dist: number
}

class Pad {
  readonly controller: Controller;
  readonly padNumber: number;

  readonly noteStore: Writable<PadNote> = writable(null);
  note: PadNote;

  readonly highlightedStore: Writable<boolean>;
  private highlighted: boolean = false;

  readonly pressedStore: Writable<boolean>;
  private pressed: boolean = false;

  pressedColor: PadColor;
  highlightedColor: PadColor;

  rootColor: PadColor;
  scaleColor: PadColor;

  constructor(controller: Controller, padNumber: number) {
    this.controller = controller;
    this.padNumber = padNumber;

    this.highlightedStore = writable(this.highlighted)
    this.highlightedColor = this.controller.padColors[DEFAULT_HIGHLIGHTED_COLOR]
    this.pressedStore = writable(this.pressed)
    this.pressedColor = this.controller.padColors[DEFAULT_PRESSED_COLOR]

    this.rootColor = this.controller.padColors[DEFAULT_ROOT_COLOR]
    this.scaleColor = this.controller.padColors[DEFAULT_SCALE_COLOR]
  }

  setNote(note: PadNote) {
    this.note = note;
    this.noteStore.set(note);

    this.draw()
  }

  on() {
    this.pressed = true;
    this.pressedStore.set(this.pressed);

    this.draw()
  }
  off() {
    this.pressed = false;
    this.pressedStore.set(this.pressed);

    this.draw()
  }

  highlight(color?: PadColor) {
    if (color) {
      this.highlightedColor = color;
    } else {
      this.highlightedColor = this.controller.padColors[DEFAULT_HIGHLIGHTED_COLOR]
    }

    this.highlighted = true
    this.highlightedStore.set(this.highlighted)

    this.draw()
  }
  unhighlight() {
    this.highlighted = false
    this.highlightedStore.set(this.highlighted)

    this.draw()
  }

  /**
   * Draws pads on the physical controller
   *
   * @private
   * @memberof Pad
   */
  private draw() {
    if (this.controller.output) {
      if (this.pressed) {
        this.controller.output.playNote(this.padNumber, 'all', {
          velocity: getColorVelocity(this.pressedColor)
        })
      } else if (this.highlighted) {
        this.controller.output.playNote(this.padNumber, 'all', {
          velocity: getColorVelocity(this.highlightedColor)
        })
      } else if (this.note.isRoot) {
        this.controller.output.playNote(this.padNumber, 'all', {
          velocity: getColorVelocity(this.rootColor)
        })
      } else if (this.note.isScale) {
        this.controller.output.playNote(this.padNumber, 'all', {
          velocity: getColorVelocity(this.scaleColor)
        })
      } else {
        this.controller.output.stopNote(this.padNumber, 'all')
      }
    }
  }
}

export { Pad }
