import { Progression, note } from "@tonaljs/tonal";

import type { Chord } from "@tonaljs/chord";
import type { Note } from "@tonaljs/core";
import { detect } from "@tonaljs/chord-detect";
import { get } from "@tonaljs/chord";

export type ChordNotes = {
    chord: Chord;
    notes: Note[];
};

export function chordDetect(notes: Note[]): ChordNotes {
    let chordNotes = [...notes];

    for (let i = 0; i < chordNotes.length; i++) {
        // Shift array to the left and try again
        const firstNote = chordNotes.shift();
        chordNotes.push(firstNote);

        let chords = detect(chordNotes.map((n) => n.pc));

        let minorAugmentedChord = null;

        for (const currentChord of chords) {
            let parsedChord = get(currentChord);

            if (parsedChord.empty) {
                continue
            }

            // Skip minor augmented initially
            // See https://github.com/tonaljs/tonal/issues/242
            if (parsedChord.type === "minor augmented") {
                minorAugmentedChord = parsedChord
                continue
            }

            return {
                chord: parsedChord,
                notes: chordNotes,
            };
        }

        // If the only available chord is the minor augmented chord, return it
        /* if (minorAugmentedChord) {
            return {
                chord: minorAugmentedChord,
                notes: chordNotes,
            };
        } */
    }

    return null
}

export function getProgression(
    root: string,
    octave: number,
    progression: string
): ChordNotes[] {
    const chords = Progression.fromRomanNumerals(
        root,
        progression.split(" ")
    );

    const chordNotes = []

    for (const chord of chords) {
        const parsedChord = get(chord);

        chordNotes.push({
            chord: parsedChord,
            notes: parsedChord.notes.map(
                (noteName) => note(`${noteName}${octave}`) as Note
            ),
        });
    }

    return chordNotes
}