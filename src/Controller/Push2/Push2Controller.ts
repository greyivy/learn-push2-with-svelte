import { Controller, ControllerMeta } from '../../Controller'
import type { PadColor, PadColorCollection, PadNoteColorCollection } from '../PadColor'
import {
  synthConfigurations,
  synthConfiguration
} from "../../configurationStore";

import Push2Component from './Push2Component.svelte'
import { get } from 'svelte/store';

const CONTROLS_SYNTH = [20, 21, 22, 23, 24, 25, 26, 27]

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
    super(8, 8, 36, [
      {
        controlNumber: 55,
        controlType: 'octaveUp'
      }, {
        controlNumber: 54,
        controlType: 'octaveDown'
      },
      ...CONTROLS_SYNTH.map((controlNumber, i) => ({
        controlNumber,
        controlType: `synth${i}`
      }))
    ])

    synthConfiguration.subscribe(currentSynthConfiguration => this.drawSynthButtons(currentSynthConfiguration))

    for (let i = 0; i < CONTROLS_SYNTH.length; i++) {
      this.addEventListener(`synth${i}`, () => {
        if (synthConfigurations[i]) {
          synthConfiguration.set(synthConfigurations[i])
        }
      })
    }
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

  setDevices(inputId, outputId) {
    super.setDevices(inputId, outputId)

    this.drawSynthButtons(get(synthConfiguration))
  }

  drawSynthButtons(currentSynthConfiguration) {
    if (this.output) {
      for (let i = 0; i < CONTROLS_SYNTH.length; i++) {
        const controlNumber = CONTROLS_SYNTH[i]

        if (synthConfigurations[i]) {
          if (synthConfigurations[i] === currentSynthConfiguration) {
            this.controls[controlNumber].setColor(127)
          } else {
            this.controls[controlNumber].setColor(50)
          }
        } else {
          this.controls[controlNumber].setColor(0)
        }
      }
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
