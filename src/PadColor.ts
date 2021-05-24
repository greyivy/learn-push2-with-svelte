export type PadColor = {
    background: string;
    foreground: string;
    velocity: number;
}

export function getColorVelocity(color: PadColor): number {
    return Math.min(1, Math.max(0, color.velocity / 127))
}

export type PadColorCollection = {
    [name: string]: PadColor
}

export type PadNoteColorCollection = {
    default: PadColor,
    0?: PadColor, // Black key
    1?: PadColor, // Root
    2?: PadColor,
    3?: PadColor,
    4?: PadColor,
    5?: PadColor,
    6?: PadColor,
    7?: PadColor,
    8?: PadColor,
    9?: PadColor,
    10?: PadColor,
    11?: PadColor,
    12?: PadColor
  }