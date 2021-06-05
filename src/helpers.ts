const NOTES: string[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const OCTAVES: number[] = [1, 2, 3, 4, 5, 6]

const MAX_OCTAVE = Math.max(...OCTAVES)
const MIN_OCTAVE = Math.min(...OCTAVES)

export function getNext(value: any, values: any[]) {
    if (values.indexOf(value) === values.length - 1) {
        return values[0]
    } else {
        return values[values.indexOf(value) + 1]
    }
}
export function getPrevious(value: any, values: any[]) {
    if (values.indexOf(value) === 0) {
        return values[values.length - 1]
    } else {
        return values[values.indexOf(value) - 1]
    }
}

export { NOTES, OCTAVES, MAX_OCTAVE, MIN_OCTAVE }