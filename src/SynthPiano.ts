import { Piano } from '@tonejs/piano'
import { Writable, writable } from 'svelte/store'
import { Synth } from './Synth'

class SynthPiano extends Synth {
  readonly initialized: Writable<boolean> = writable(false)

  private piano: Piano

  constructor() {
    super()

      ; (async () => {
        const piano = new Piano({
          velocities: 5 // 5 velocity steps
        })
        piano.toDestination()
        piano.load().then(() => {
          this.piano = piano
          this.initialized.set(true)
        })
      })()
  }

  down(note: string, velocity: number): void {
    if (this.piano) {
      this.piano.keyDown({ note, velocity })
    }
  }
  up(note: string): void {
    if (this.piano) {
      this.piano.keyUp({ note })
    }
  }
}

export default SynthPiano
