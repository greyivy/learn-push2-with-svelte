export type PadColor = {
    html: string;
    velocity: number;
}

export function getColorVelocity(color: PadColor): number {
    return Math.min(1, Math.max(0, color.velocity / 127))
}

export type PadColorCollection = {
    RED: PadColor,
    GREEN: PadColor,
    BLUE: PadColor,
    [name: string]: PadColor
}