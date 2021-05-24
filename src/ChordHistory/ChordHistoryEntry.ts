import type { Note } from "@tonaljs/core";
import type { Chord } from "@tonaljs/chord";

export type ChordHistoryEntry = {
    chord: Chord;
    notes: Note[];
};