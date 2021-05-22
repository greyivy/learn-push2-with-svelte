class Note {
  constructor (note, octave) {
    this.note = note
    this.octave = octave
  }

  get name () {
    return `${this.note}${this.octave}`
  }
}

export { Note }
