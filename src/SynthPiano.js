import { Piano } from '@tonejs/piano'
import { derived, writable } from 'svelte/store'
import { Tone } from 'tone/build/esm/core/Tone';
import { Synth } from './Synth'

class SynthPiano extends Synth {
  constructor () {
    super()

    this.initialized = derived(this.#initializedState, v => v)
    ;(async () => {
      const piano = new Piano({
        velocities: 5 // 5 velocity steps
      })
      piano.toDestination()
      piano.load().then(() => {
        this.piano = piano
        this.#initializedState.set(true)
      })
    })()
  }

  #initializedState = writable(false)

  down (note, velocity) {
    if (this.piano) {
      this.piano.keyDown({ note, velocity })
    }
  }
  up (note) {
    if (this.piano) {
      this.piano.keyUp({ note })
    }
  }
}

export default SynthPiano
