import { writable } from 'svelte/store'
import WebMidi from 'webmidi'
import { Pad } from './Pad'

class Controller {
  /**
   * Creates an instance of Controller.
   * @param {*} offset number of bottom-left pad
   * @memberof Controller
   */
  constructor (
    rows,
    columns,
    offset,
    layoutGenerator,
    inputId,
    outputId,
    synth
  ) {
    this.rows = rows
    this.columns = columns
    this.offset = offset

    console.log(
      `Initializing controller with input=${inputId}, output=${outputId}`
    )

    this.input = WebMidi.getInputById(inputId)
    this.output = WebMidi.getOutputById(outputId)
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
        padNumber,
        layout[padNumber],
        this.output,
        this.synth
      )
    }

    this.getLayout()
  }

  getPadByNote (note) {
    const pad = Object.values(this.pads).find(pad => pad.note.name === note)
    return pad ? pad.padNumber : null
  }
  getPadByIndex (index) {
    return this.pads[this.offset + index]
  }

  // Returns 3D array of pad numbers
  getLayout () {
    let rows = []

    let padNumber = this.offset
    for (let r = 0; r < this.rows; r++) {
      let rowPads = []

      for (let c = 0; c < this.columns; c++) {
        rowPads.push(padNumber)
        padNumber++
      }

      rows = [rowPads, ...rows]
    }

    return rows
  }

  destroy () {
    console.log('Destroying controller')

    if (this.input) {
      this.input.removeListener()
    }
  }
}

export { Controller }
