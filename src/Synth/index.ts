import type { Note } from '@tonaljs/core'

export abstract class Synth {
  abstract down(note: Note, velocity: number): void
  abstract up(note: Note): void
}
