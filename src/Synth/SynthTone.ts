import { Writable, writable } from 'svelte/store'
import * as Tone from 'tone'
import type { Note } from '@tonaljs/core'
import { Synth, SynthMeta } from './'

class SynthTone extends Synth {
    readonly initialized: Writable<boolean> = writable(false)

    private synth: Tone.PolySynth

    constructor(synthType) {
        super()

        Tone.start().then(() => {
            // Can be Tone.Synth, Tone.FMSynth, Tone.AMSynth, or Tone.NoiseSynth
            this.synth = new Tone.PolySynth(synthType).toDestination();
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

export class SynthBasic extends SynthTone {
    constructor() {
        super(Tone.Synth)
    }

    static getInstance(): SynthBasic {
        return new SynthBasic()
    }

    static getMeta(): SynthMeta {
        return {
            id: 'basic',
            label: 'Basic'
        }
    }
}

export class SynthFM extends SynthTone {
    constructor() {
        super(Tone.FMSynth)
    }

    static getInstance(): SynthFM {
        return new SynthFM()
    }

    static getMeta(): SynthMeta {
        return {
            id: 'fm',
            label: 'FM'
        }
    }
}

export class SynthAM extends SynthTone {
    constructor() {
        super(Tone.AMSynth)
    }

    static getInstance(): SynthAM {
        return new SynthAM()
    }

    static getMeta(): SynthMeta {
        return {
            id: 'am',
            label: 'AM'
        }
    }
}

export class SynthNoise extends SynthTone {
    constructor() {
        super(Tone.NoiseSynth)
    }

    static getInstance(): SynthNoise {
        return new SynthAM()
    }

    static getMeta(): SynthMeta {
        return {
            id: 'noise',
            label: 'Noise'
        }
    }
}
