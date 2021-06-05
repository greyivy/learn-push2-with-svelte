export type ChordProgression = {
    name: string;
    progression: string[]
}

export const chordProgressions: ChordProgression[] = [
    {
        name: "Test progression",
        progression: ["IMaj7", "IIm7", "V7"],
    },
    {
        name: "ii-V-I progression",
        progression: ["ii", "V", "I"],
    },
];