import type { Controller } from "./Controller"

import type { Note } from "@tonaljs/core";
import { note } from "@tonaljs/core";

const NOTES: string[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export abstract class LayoutGenerator {
  abstract generate(controller: Controller): {
    [padNumber: number]: string
  }
}

export class LayoutGeneratorChromatic extends LayoutGenerator {
  readonly root: Note;

  constructor(root: Note) {
    super()

    this.root = root
  }

  generate(controller: Controller) {
    let notes = {}

    console.log(this.root)

    let currentPadNumber: number = controller.offset
    let currentNote: number = NOTES.indexOf(this.root.pc)
    let currentOctave: number = this.root.oct

    for (let r = 0; r < controller.rows; r++) {
      for (let c = 0; c < controller.columns; c++) {
        notes[currentPadNumber] = note(`${NOTES[currentNote]}${currentOctave}`)

        if (currentNote === NOTES.length - 1) {
          currentNote = 0
          currentOctave++
        } else {
          currentNote++
        }

        currentPadNumber++
      }
    }

    return notes
  }
}
