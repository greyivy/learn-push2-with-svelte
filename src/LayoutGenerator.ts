import type { Controller } from "./Controller"
import { Note } from "./Note"

const NOTES: string[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export abstract class LayoutGenerator {
  abstract generate(controller: Controller): {
    [padNumber: number]: string
  }
}

export class LayoutGeneratorChromatic extends LayoutGenerator {
  readonly root: string;
  readonly startingOctave: number;

  constructor(root: string, startingOctave: number) {
    super()

    this.root = root
    this.startingOctave = startingOctave
  }

  generate(controller: Controller) {
    let notes = {}

    let currentPadNumber: number = controller.offset
    let currentNote: number = NOTES.indexOf(this.root)
    let currentOctave: number = this.startingOctave

    for (let r = 0; r < controller.rows; r++) {
      for (let c = 0; c < controller.columns; c++) {
        notes[currentPadNumber] = new Note(NOTES[currentNote], currentOctave)

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
