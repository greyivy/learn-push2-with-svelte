import { writable, Writable } from 'svelte/store'
import type { Note } from './Note';
import { getColorVelocity, PadColor } from './PadColor'
import type { Controller } from './Controller'

const DEFAULT_PRESSED_COLOR = 'RED'
const DEFAULT_HIGHLIGHTED_COLOR = 'GREEN'

class Pad {
  readonly controller: Controller;
  readonly padNumber: number;
  readonly note: Note;

  private highlightedState: boolean = false;
  private pressedState: boolean = false;

  readonly highlighted: Writable<boolean>;
  readonly pressed: Writable<boolean>;

  pressedColor: PadColor; // TODO Color class
  highlightedColor: PadColor;

  constructor(controller: Controller, padNumber: number, note: Note) {
    this.controller = controller;
    this.padNumber = padNumber
    this.note = note

    this.highlighted = writable(this.highlightedState)
    this.highlightedColor = this.controller.padColors[DEFAULT_HIGHLIGHTED_COLOR]
    this.pressed = writable(this.pressedState)
    this.pressedColor = this.controller.padColors[DEFAULT_PRESSED_COLOR]
  }

  on(velocity?: number) {
    this.pressedState = true;
    this.pressed.set(this.pressedState);

    this.controller.synth.down(this.note.name, velocity) // TODO velocity

    this.draw()
  }
  off() {
    this.pressedState = false;
    this.pressed.set(this.pressedState);

    this.controller.synth.up(this.note.name)

    this.draw()
  }

  highlight(color?: PadColor) {
    if (color) {
      this.highlightedColor = color;
    } else {
      this.highlightedColor = this.controller.padColors[DEFAULT_HIGHLIGHTED_COLOR]
    }

    this.highlightedState = true
    this.highlighted.set(this.highlightedState)

    this.draw()
  }
  unhighlight() {
    this.highlightedState = false
    this.highlighted.set(this.highlightedState)

    this.draw()
  }

  /**
   * Draws pads on the physical controller
   *
   * @private
   * @memberof Pad
   */
  private draw() {
    if (this.pressedState) {
      this.controller.output.playNote(this.padNumber, 'all', {
        velocity: getColorVelocity(this.pressedColor)
      })
    } else if (this.highlightedState) {
      this.controller.output.playNote(this.padNumber, 'all', {
        velocity: getColorVelocity(this.highlightedColor)
      })
    } else {
      this.controller.output.stopNote(this.padNumber, 'all')
    }
  }
}

export { Pad }
