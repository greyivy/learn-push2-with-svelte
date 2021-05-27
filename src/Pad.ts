import { writable, Writable } from 'svelte/store'
import { getColorVelocity, PadColor, PadNoteColorCollection } from './PadColor'
import type { Controller } from './Controller'
import type { Note } from '@tonaljs/core'

export interface PadNote extends Note {
  noteNumber: number
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

  hovered: boolean = false;

  overridePadNoteColors: PadNoteColorCollection;
  overridePadPressedColor: PadColor;
  overridePadHighlightColor: PadColor;
  overridePadHoverColor: PadColor;

  constructor(controller: Controller, padNumber: number) {
    this.controller = controller;
    this.padNumber = padNumber;

    this.highlightedStore = writable(this.highlighted)
    this.pressedStore = writable(this.pressed)
  }

  get padNoteColor(): PadColor {
    if (this.overridePadNoteColors) {
      return this.overridePadNoteColors[this.note.noteNumber] || this.overridePadNoteColors.default
    } else {
      return this.controller.defaultPadNoteColors[this.note.noteNumber] || this.controller.defaultPadNoteColors.default
    }
  }
  get padPressedColor(): PadColor {
    return this.overridePadPressedColor || this.controller.defaultPadPressedColor
  }
  get padHighlightColor(): PadColor {
    return this.overridePadHighlightColor || this.controller.defaultPadHighlightColor
  }
  get padHoverColor(): PadColor {
    return this.overridePadHoverColor || this.controller.defaultPadHoverColor
  }

  setNote(note: PadNote) {
    // Unhighlight
    this.highlighted = false
    this.highlightedStore.set(this.highlighted)

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
      this.overridePadHighlightColor = color;
    } else {
      this.overridePadHighlightColor = null
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

  mouseover() {
    this.hovered = true

    this.draw()
  }
  mouseout() {
    this.hovered = false

    this.draw()
  }

  /**
   * Draws pads on the physical controller
   *
   * @private
   * @memberof Pad
   */
  draw() {
    if (this.controller.output) {
      if (this.pressed) {
        this.controller.output.playNote(this.padNumber, 'all', {
          velocity: getColorVelocity(this.padPressedColor)
        })
      } else if (this.hovered) {
        this.controller.output.playNote(this.padNumber, 'all', {
          velocity: getColorVelocity(this.padHoverColor)
        })
      } else if (this.highlighted) {
        this.controller.output.playNote(this.padNumber, 'all', {
          velocity: getColorVelocity(this.padHighlightColor)
        })
      } else {
        const color = this.padNoteColor

        if (color && typeof color.velocity === 'number') {
          this.controller.output.playNote(this.padNumber, 'all', {
            velocity: getColorVelocity(color)
          })
        } else {
          this.controller.output.stopNote(this.padNumber, 'all')
        }
      }
    }
  }
}

export { Pad }
