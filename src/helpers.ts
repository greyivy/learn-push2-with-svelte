const NOTES: string[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const OCTAVES: number[] = [1, 2, 3, 4, 5, 6]

const MAX_OCTAVE = Math.max(...OCTAVES)
const MIN_OCTAVE = Math.min(...OCTAVES)

export { NOTES, OCTAVES, MAX_OCTAVE, MIN_OCTAVE }