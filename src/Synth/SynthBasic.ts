import { Writable, writable } from 'svelte/store'
import * as Tone from 'tone'
import type { Note } from '@tonaljs/core'
import { Synth } from './'

class SynthBasic extends Synth {
    readonly initialized: Writable<boolean> = writable(false)

    private synth: Tone.PolySynth

    constructor() {
        super()

        Tone.start().then(() => {
            // Can be Tone.Synth, Tone.FMSynth, Tone.AMSynth, or Tone.NoiseSynth
            const synthType = Tone.Synth

            this.synth = new Tone.PolySynth(Tone.FMSynth).toDestination();
            this.initialized.set(true)
        })
    }

    down(note: Note, velocity: number): void {
        if (this.synth) {
            this.synth.triggerAttack(note.name.toString())
        }
    }
    up(note: Note): void {
        if (this.synth) {
            this.synth.triggerRelease(note.name.toString())
        }
    }
}

export default SynthBasic
