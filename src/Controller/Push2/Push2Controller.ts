import { Controller } from '../../Controller'
import type { PadColorCollection } from '../../PadColor'

const padColors: PadColorCollection = {
  RED: {
    html: '#FF0000',
    velocity: 127
  },
  GREEN: {
    html: '#00FF00',
    velocity: 126
  },
  BLUE: {
    html: '#0000FF',
    velocity: 125
  },
  YELLOW: {
    html: 'yellow',
    velocity: 8
  }
}

class Push2Controller extends Controller {
  constructor(layoutGenerator, inputId, outputId, synth) {
    super(8, 8, 36, padColors, layoutGenerator, inputId, outputId, synth)
  }
}

// https://github.com/ffont/push2-python/blob/master/push2_python/constants.py
const PAD_COLORS = {
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

export default Push2Controller
