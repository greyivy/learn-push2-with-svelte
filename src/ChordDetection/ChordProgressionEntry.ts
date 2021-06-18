export type ChordProgressionEntry = {
    name: string;
    progression: string[]
}

export const chordProgressionEntries: ChordProgressionEntry[] = [
    {
        name: "Test progression",
        progression: ["IMaj7", "IIm7", "V7"],
    }, {
        name: "ii-V-I progression",
        progression: ["ii", "V", "I"],
    }, {
        name: "I-IV-V-I progression",
        progression: ["I", "IV", "V", "I"],
    }, {
        name: "I-ii-V-I progression",
        progression: ["I", "ii", "V", "I"],
    }, {
        name: "I-vi-IV-V progression",
        progression: ["I", "vi", "IV", "V"],
    }, {
        name: "I-vi-ii-V progression",
        progression: ["I", "vi", "ii", "V"],
    }, {
        name: "I-IV-vi-V progression",
        progression: ["I", "IV", "vi", "V"],
    }, {
        name: "I-V-vi-IV progression",
        progression: ["I", "V", "vi", "IV"],
    }
];