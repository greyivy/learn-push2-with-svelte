import { Controller, ControllerMeta } from '../../Controller'
import type { VelocityColor, VelocityColorCollection, NoteNumberVelocityColorCollection, ControlVelocityColorCollection } from '../VelocityColor'
import {
  synthConfigurations,
  synthConfiguration
} from "../../configurationStore";

import Push2Component from './Push2Component.svelte'
import { get } from 'svelte/store';

const CONTROL_NUMBERS_SYNTH_CONFIGURATIONS = [20, 21, 22, 23, 24, 25, 26, 27]

// TODO metronome, menu system (for scales, etc?)
class Push2Controller extends Controller {
  colors: VelocityColorCollection = {
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
    },
    PINK: {
      background: '#FF0080',
      foreground: '#FFF',
      velocity: 25
    }
  }

  controlColors: ControlVelocityColorCollection = {
    on: this.colors.WHITE,
    off: this.colors.OFF,
    active: this.colors.RED
  }
  noteColors: NoteNumberVelocityColorCollection = {
    default: this.colors.WHITE,
    0: this.colors.OFF,
    1: this.colors.RED,
    3: this.colors.YELLOW
  }
  pressedColor: VelocityColor = this.colors.GREEN;
  highlightColor: VelocityColor = this.colors.BLUE;
  hoverColor: VelocityColor = this.colors.PINK;

  constructor() {
    super(8, 8, 36, [
      {
        controlNumber: 50,
        controlType: 'rootLetter'
      },
      {
        controlNumber: 55,
        controlType: 'rootOctaveUp'
      }, {
        controlNumber: 54,
        controlType: 'rootOctaveDown'
      },
      {
        controlNumber: 58,
        controlType: 'scaleName'
      },
      {
        controlNumber: 31,
        controlType: 'layoutGeneratorConfiguration'
      },
      ...CONTROL_NUMBERS_SYNTH_CONFIGURATIONS.map((controlNumber, i) => ({
        controlNumber,
        controlType: `synth${i}`
      }))
    ])

    // Synth buttons
    synthConfiguration.subscribe(currentSynthConfiguration => this.drawControlsSynthConfiguration(currentSynthConfiguration))

    for (let i = 0; i < CONTROL_NUMBERS_SYNTH_CONFIGURATIONS.length; i++) {
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

    this.drawControlsSynthConfiguration(get(synthConfiguration))
  }

  drawControlsSynthConfiguration(currentSynthConfiguration) {
    for (let i = 0; i < CONTROL_NUMBERS_SYNTH_CONFIGURATIONS.length; i++) {
      const controlNumber = CONTROL_NUMBERS_SYNTH_CONFIGURATIONS[i]

      if (synthConfigurations[i]) {
        if (synthConfigurations[i] === currentSynthConfiguration) {
          this.controls[controlNumber].setState('active')
        } else {
          this.controls[controlNumber].setStateOn()
        }
      } else {
        this.controls[controlNumber].setStateOff()
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
