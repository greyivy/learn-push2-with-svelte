import { LayoutGenerator, LayoutGeneratorMeta } from ".";

import type { Controller } from "../Controller"
import { NOTES } from "../helpers";
import type { Note } from "@tonaljs/core";
import { note } from "@tonaljs/core";
import { enharmonic } from "@tonaljs/note";
import { transpose } from "@tonaljs/core";
import { Interval } from "@tonaljs/tonal";

type LayoutAbleton = "3rds" | "4ths"

// 29.5.1 @ https://www.ableton.com/en/manual/using-push-2/
// TODO direction (vertical/horizontal)
class LayoutGeneratorAbleton extends LayoutGenerator {
    readonly root: Note;
    readonly layout: LayoutAbleton;

    constructor(root: Note, layout: LayoutAbleton) {
        super(root)

        this.layout = layout
    }

    generate(controller: Controller) {
        let notes = {}

        let currentPadNumber: number = controller.offset
        let currentNoteIndex: number = NOTES.indexOf(this.root.pc)
        let currentOctave: number = this.root.oct

        let rows = []

        for (let r = 0; r < controller.rows; r++) {
            let row = []

            if (r === 0) {
                // Generate the first row normally
                for (let c = 0; c < controller.columns; c++) {
                    notes[currentPadNumber] = note(`${NOTES[currentNoteIndex]}${currentOctave}`)
                    row.push(notes[currentPadNumber])

                    if (currentNoteIndex === NOTES.length - 1) {
                        currentNoteIndex = 0
                        currentOctave++
                    } else {
                        currentNoteIndex++
                    }

                    currentPadNumber++
                }
            } else {
                for (let c = 0; c < controller.columns; c++) {
                    const previousRowNote: Note = rows[r - 1][c]

                    // 4ths chromatic: 4P -- correct and working
                    // TODO 4ths in key (get scaleName from controller)
                    // TODO 3ds chromatic
                    // TODO 3ds in key
                    // Sequential chromatic: 6m --- correct and working (handled by LayoutGeneratorSequential)

                    let newNote;

                    if (this.layout === '3rds') {

                    } else if (this.layout === '4ths') {
                        newNote = note(transpose(previousRowNote.name, '4P'))
                    }

                    if (newNote.acc === 'b') {
                        // Convert flats to sharps
                        newNote = note(enharmonic(newNote.name))
                    }

                    notes[currentPadNumber] = newNote
                    row.push(notes[currentPadNumber])

                    currentPadNumber++
                }
            }

            rows.push(row)
        }

        return notes
    }
}

export class LayoutGeneratorAbleton4ths extends LayoutGeneratorAbleton {
    readonly root: Note;

    constructor(root: Note) {
        super(root, "4ths")
    }

    static getInstance(root: Note): LayoutGeneratorAbleton4ths {
        return new LayoutGeneratorAbleton4ths(root);
    }

    static getMeta(): LayoutGeneratorMeta {
        return {
            id: 'ableton4ths',
            label: '4ths chromatic'
        }
    }
}
export class LayoutGeneratorAbleton3rds extends LayoutGeneratorAbleton {
    readonly root: Note;

    constructor(root: Note) {
        super(root, "3rds")
    }

    static getInstance(root: Note): LayoutGeneratorAbleton3rds {
        return new LayoutGeneratorAbleton3rds(root);
    }

    static getMeta(): LayoutGeneratorMeta {
        return {
            id: 'ableton3ds',
            label: '3ds Chromatic'
        }
    }
}
