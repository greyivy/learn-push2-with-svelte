export type VelocityColor = {
    background: string;
    foreground: string;
    velocity: number;
}

export function getColorVelocity(color: VelocityColor): number {
    return Math.min(1, Math.max(0, color.velocity / 127))
}

export type VelocityColorCollection = {
    [name: string]: VelocityColor
}

export type NoteNumberVelocityColorCollection = {
    default: VelocityColor, // All other white keys
    0?: VelocityColor, // Black keys
    1?: VelocityColor, // Root
    2?: VelocityColor,
    3?: VelocityColor, // 3rd
    4?: VelocityColor,
    5?: VelocityColor, // ...
    6?: VelocityColor,
    7?: VelocityColor,
    8?: VelocityColor,
    9?: VelocityColor,
    10?: VelocityColor,
    11?: VelocityColor,
    12?: VelocityColor
  }

export type ControlVelocityColorCollection = {
    off: VelocityColor,
    on: VelocityColor,
    [state: string]: VelocityColor
}
