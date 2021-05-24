import type { Note } from '@tonaljs/core'

export type SynthConfiguration = typeof Synth & { getMeta(): SynthMeta, getInstance(): Synth }

export type SynthMeta = {
  id: string;
  label: string;
}

export abstract class Synth {
  constructor() { };

  abstract down(note: Note, velocity: number): void
  abstract up(note: Note): void
}
