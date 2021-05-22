import { Note } from "./Note"

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

class LayoutGenerator {
  constructor () {}

  // Should return an object of notes mapped to pad numbers
  generate (controller) {}
}

class LayoutGeneratorChromatic extends LayoutGenerator {
  constructor (root, startingOctave) {
    super()

    this.root = root
    this.startingOctave = startingOctave
  }

  generate (controller) {
    let notes = {}

    let currentPadNumber = controller.offset
    let currentNote = NOTES.indexOf(this.root)
    let currentOctave = this.startingOctave

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

class LayoutGenerator3rds extends LayoutGenerator {
  
}

export { LayoutGenerator, LayoutGeneratorChromatic }
