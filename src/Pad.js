import { COLORS, getColorVelocity } from './pushHelper'

import { derived, writable } from 'svelte/store'

const DEFAULT_PRESSED_COLOR = COLORS.PINK

class Pad {
  constructor (padNumber, note, output, synth) {
    this.padNumber = padNumber
    this.output = output
    this.synth = synth

    this.note = note
    this.highlighted = writable(false)
    this.highlightColor = null
    this.pressed = derived(this.#pressedState, v => v)
    this.pressedColor = DEFAULT_PRESSED_COLOR
  }

  #pressedState = writable(false)

  on () {
    this.#pressedState.set(true)
    this.synth.down(this.note.name, 0.5) // TODO velocity
    this.output.playNote(this.padNumber, 'all', {
      duration: 60000, // Timeout after 60s
      velocity: getColorVelocity(this.pressedColor)
    })
  }
  off () {
    this.#pressedState.set(false)
    this.synth.up(this.note.name)
    this.output.stopNote(this.padNumber, 'all')
  }

  highlight () {
    this.highlighted.set(true)
  }
  unhighlight () {
    this.highlighted.set(false)
  }

  get noteName () {
    return ``
  }
}

export { Pad }
