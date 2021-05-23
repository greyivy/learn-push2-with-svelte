import { Writable, writable } from 'svelte/store'
import WebMidi, { Input, Output } from 'webmidi'
import { Pad } from './Pad'
import type { PadColorCollection } from './PadColor'
import type { Synth } from './Synth'

type PadCollection = {
  [padNumber: number]: Pad
}

class Controller {
  readonly rows: number;
  readonly columns: number;
  readonly offset: number;

  readonly padColors: PadColorCollection;

  readonly input: Input;
  readonly output: Output;
  readonly synth: Synth;

  readonly notes: Writable<Set<string>>;
  readonly pads: PadCollection;

  /**
   * Creates an instance of Controller.
   * @param {*} offset number of bottom-left pad
   * @memberof Controller
   */
  constructor(
    rows: number,
    columns: number,
    offset: number,
    padColors: PadColorCollection,
    layoutGenerator,
    inputId: string,
    outputId: string,
    synth: Synth
  ) {
    this.rows = rows
    this.columns = columns
    this.offset = offset
    this.padColors = padColors

    console.log(
      `Initializing controller with input=${inputId}, output=${outputId}`
    )

    this.input = WebMidi.getInputById(inputId) as Input
    this.output = WebMidi.getOutputById(outputId) as Output
    this.synth = synth

    if (!this.input || !this.output) {
      throw new Error()
    }

    this.notes = writable(new Set())

    this.input.addListener('noteon', 'all', e => {
      const pad = this.pads[e.note.number]
      this.notes.update(notes => {
        notes.add(pad.note.name)
        return notes
      })
      pad.on()
    })
    this.input.addListener('noteoff', 'all', e => {
      const pad = this.pads[e.note.number]
      this.notes.update(notes => {
        notes.delete(pad.note.name)
        return notes
      })
      pad.off()
    })

    const layout = layoutGenerator.generate(this)

    this.pads = {}
    for (let i = 0; i < rows * columns; i++) {
      const padNumber = i + offset

      this.pads[padNumber] = new Pad(
        this,
        padNumber,
        layout[padNumber]
      )
    }

    this.getLayout()
  }

  getPadByNote(note: string): Pad {
    return Object.values(this.pads).find(pad => pad.note.name === note) || null
  }
  getPadByIndex(index: number): Pad {
    return this.pads[this.offset + index]
  }

  // Returns 3D array of pad numbers
  getLayout(): number[][] {
    let layout: number[][] = []

    let padNumber = this.offset
    for (let r = 0; r < this.rows; r++) {
      let layoutRow: number[] = []

      for (let c = 0; c < this.columns; c++) {
        layoutRow.push(padNumber)
        padNumber++
      }

      layout = [layoutRow, ...layout]
    }

    return layout
  }

  destroy(): void {
    console.log('Destroying controller')

    if (this.input) {
      this.input.removeListener()
    }
  }
}

export { Controller }
