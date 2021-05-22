// https://github.com/ffont/push2-python/blob/master/push2_python/constants.py
const COLORS = {
  BLACK: 0,
  ORANGE: 3,
  YELLOW: 8,
  TURQUOISE: 15,
  DARK_GRAY2: 16,
  PURPLE: 22,
  PINK: 25,
  LIGHT_GRAY2: 48,
  WHITE: 122,
  LIGHT_GRAY: 123,
  DARK_GRAY: 124,
  BLUE: 125,
  GREEN: 126,
  RED: 127
}

// TODO integrate this into the controller/push2 class. should pass the colors obj and default colors. colors obj should include html colors for the component!

const getColorVelocity = color => Math.min(1, Math.max(0, color / 127)) // Get "attack" param for WebMidi library (from 0 - 1)

export { COLORS, getColorVelocity }
