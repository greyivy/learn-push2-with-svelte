class Note {
  readonly note: string
  readonly octave: number

  constructor (note: string, octave: number) {
    this.note = note
    this.octave = octave
  }

  get name (): string {
    return `${this.note}${this.octave}`
  }
}

export { Note }
