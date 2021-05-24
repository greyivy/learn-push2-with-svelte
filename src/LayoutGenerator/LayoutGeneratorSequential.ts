
import type { Controller } from "../Controller"

import type { Note } from "@tonaljs/core";
import { note } from "@tonaljs/core";
import { NOTES } from "../helpers";
import { LayoutGenerator, LayoutGeneratorMeta } from ".";

export class LayoutGeneratorSequential extends LayoutGenerator {
    readonly root: Note;

    constructor(root: Note) {
        super(root)
    }

    static getInstance(root: Note): LayoutGeneratorSequential {
        return new LayoutGeneratorSequential(root);
    }

    static getMeta(): LayoutGeneratorMeta {
        return {
            id: 'sequential',
            label: 'Sequential'
        }
    }

    generate(controller: Controller) {
        let notes = {}

        let currentPadNumber: number = controller.offset
        let currentNote: number = NOTES.indexOf(this.root.pc)
        let currentOctave: number = this.root.oct

        for (let r = 0; r < controller.rows; r++) {
            for (let c = 0; c < controller.columns; c++) {
                notes[currentPadNumber] = note(`${NOTES[currentNote]}${currentOctave}`)

                if (currentNote === NOTES.length - 1) {
                    currentNote = 0
                    currentOctave++
                } else {
                    currentNote++
                }

                currentPadNumber++
            }
        }

        return notes
    }
}
