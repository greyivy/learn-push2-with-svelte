import { Progression, note } from "@tonaljs/tonal";

import type { ChordType } from "@tonaljs/chord-type";
import type { Chord } from "@tonaljs/chord";
import { Note, transpose } from "@tonaljs/core";
import { detect } from "@tonaljs/chord-detect";
import { get, getChord } from "@tonaljs/chord";

export class ChordNotes {
    readonly chord: Chord;
    readonly notes: Note[];

    private constructor(chord: Chord, notes: Note[]) {
        this.chord = chord
        this.notes = [...notes]
    }

    equals(chordNotes: ChordNotes): boolean {
        const midiA = new Set(this.notes.map(n => n.midi))
        const midiB = new Set(chordNotes.notes.map(n => n.midi))

        if (midiA.size !== midiB.size) return false;
        for (let a of midiA) if (!midiB.has(a)) return false;
        return true;
    }

    static fromChord(chord: Chord, octave: number): ChordNotes {
        const notes =
            chord.intervals
                .map(interval => transpose(`${chord.tonic}${octave}`, interval))
                .map(n => note(n) as Note)

        return new ChordNotes(chord, notes)
    }

    static fromChordType(chordType: ChordType, tonic: string, octave: number): ChordNotes {
        return ChordNotes.fromChord(getChord(chordType.name || chordType.aliases[0], tonic), octave)
    }

    // Note: notes MUST have octave
    static fromNotes(notes: Note[]): ChordNotes {
        let chordNotes = notes.map((n) => n.pc);

        for (let i = 0; i < chordNotes.length; i++) {
            let chords = detect(chordNotes);

            // let minorAugmentedChord = null;

            for (const currentChord of chords) {
                let parsedChord = get(currentChord);

                if (parsedChord.empty) {
                    continue
                }

                // Skip minor augmented initially
                // See https://github.com/tonaljs/tonal/issues/242
                if (parsedChord.type === "minor augmented") {
                    // minorAugmentedChord = parsedChord
                    continue
                }

                return new ChordNotes(parsedChord, notes);
            }

            // Shift array to the left and try again
            const firstNote = chordNotes.shift();
            chordNotes.push(firstNote);
        }

        return null;
    }

    static fromProgression(progression: string[], tonic: string, octave: number): ChordNotes[] {
        const chords = Progression.fromRomanNumerals(
            tonic,
            progression
        );

        const chordNotes: ChordNotes[] = []

        for (const chord of chords) {
            chordNotes.push(ChordNotes.fromChord(get(chord), octave))
        }

        return chordNotes
    }
}

