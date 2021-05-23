export abstract class Synth {
  abstract down(note: string, velocity: number): void
  abstract up(note: string): void
}
