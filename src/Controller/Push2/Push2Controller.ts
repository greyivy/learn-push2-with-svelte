import { Controller, ControllerMeta } from '../../Controller'
import type { PadColor, PadColorCollection, PadNoteColorCollection } from '../../PadColor'

import Push2Component from './Push2Component.svelte'

class Push2Controller extends Controller {
  padColors: PadColorCollection = {
    OFF: {
      background: null,
      foreground: null,
      velocity: null
    },
    RED: {
      background: '#FF0000',
      foreground: '#000',
      velocity: 127
    },
    GREEN: {
      background: '#00FF00',
      foreground: '#000',
      velocity: 126
    },
    BLUE: {
      background: '#0000FF',
      foreground: '#FFF',
      velocity: 125
    },
    YELLOW: {
      background: 'yellow',
      foreground: '#000',
      velocity: 8
    },
    WHITE: {
      background: '#FFF',
      foreground: '#000',
      velocity: 122
    }
  }
  defaultPadNoteColors: PadNoteColorCollection = {
    default: this.padColors.WHITE,
    0: this.padColors.OFF,
    1: this.padColors.RED,
    3: this.padColors.YELLOW
  }
  defaultPadPressedColor: PadColor = this.padColors.GREEN;
  defaultPadHighlightColor: PadColor = this.padColors.BLUE;
  defaultPadHoverColor: PadColor = this.padColors.RED;

  constructor() {
    super(8, 8, 36)
  }

  static getInstance() {
    return new Push2Controller()
  }

  static getMeta(): ControllerMeta {
    return {
      id: 'Push2',
      label: 'Ableton Push 2',
      component: Push2Component
    }
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
