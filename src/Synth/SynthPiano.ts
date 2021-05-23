import { Piano } from '@tonejs/piano'
import { Writable, writable } from 'svelte/store'
import type { Note } from '@tonaljs/core'
import { Synth } from './'

class SynthPiano extends Synth {
  readonly initialized: Writable<boolean> = writable(false)

  private piano: Piano

  constructor() {
    super()

    const piano = new Piano({
      velocities: 5 // 5 velocity steps
    })
    piano.toDestination()
    piano.load().then(() => {
      this.piano = piano
      this.initialized.set(true)
    })
  }

  down(note: Note, velocity: number): void {
    if (this.piano) {
      this.piano.keyDown({ note: note.name.toString(), velocity })
    }
  }
  up(note: Note): void {
    if (this.piano) {
      this.piano.keyUp({ note: note.name.toString() })
    }
  }
}

export default SynthPiano
