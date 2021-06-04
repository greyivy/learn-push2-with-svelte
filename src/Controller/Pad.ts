import { derived, Readable, writable, Writable } from 'svelte/store'
import { getColorVelocity, VelocityColor, NoteNumberVelocityColorCollection } from './VelocityColor'
import type { Controller } from './'
import type { Note } from '@tonaljs/core'

export interface PadNote extends Note {
  noteNumber: number
}

class Pad {
  readonly controller: Controller;
  readonly padNumber: number;

  private noteState: PadNote;
  readonly note: Writable<PadNote> = writable(null);

  getNote(): PadNote {
    return this.noteState;
  }

  private highlightedState: boolean = false;
  readonly highlighted: Readable<boolean>;

  private pressedState: boolean = false;
  readonly pressed: Readable<boolean>;

  private hoveredState: boolean = false;
  readonly hovered: Readable<boolean>;

  constructor(controller: Controller, padNumber: number) {
    this.controller = controller;
    this.padNumber = padNumber;

    this.pressed = derived([this.controller.notesPressed, this.note], ([notes, note]) => notes.includes(note))
    this.highlighted = derived([this.controller.notesHighlighted, this.note], ([notes, note]) => notes.includes(note))
    this.hovered = derived([this.controller.notesHovered, this.note], ([notes, note]) => notes.includes(note))

    this.pressed.subscribe(pressed => {
      this.pressedState = pressed
      this.draw()
    })
    this.highlighted.subscribe(highlighted => {
      this.highlightedState = highlighted
      this.draw()
    })
    this.hovered.subscribe(hovered => {
      this.hoveredState = hovered
      this.draw()
    })
  }

  get padNoteColor(): VelocityColor {
    return this.controller.noteColors[this.noteState.noteNumber] || this.controller.noteColors.default
  }

  setNote(note: PadNote) {
    this.noteState = note;
    this.note.set(note);

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
      if (this.pressedState) {
        this.controller.output.playNote(this.padNumber, 'all', {
          velocity: getColorVelocity(this.controller.pressedColor)
        })
      } else if (this.hoveredState) {
        this.controller.output.playNote(this.padNumber, 'all', {
          velocity: getColorVelocity(this.controller.hoverColor)
        })
      } else if (this.highlightedState) {
        this.controller.output.playNote(this.padNumber, 'all', {
          velocity: getColorVelocity(this.controller.highlightColor)
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
