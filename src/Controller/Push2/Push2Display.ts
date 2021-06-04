import { Push2DisplayDriver } from './Push2DisplayDriver'
import { DISPLAY_WIDTH, DISPLAY_HEIGHT } from './Push2DisplayDriver'
import { fabric } from 'fabric'
import type { Controller } from '..';
import { chord } from '../../ChordHistory/chordStore'
import { Push2DisplayKeyboard } from './Push2DisplayKeyboard';
import { layoutGeneratorConfiguration, rootLetter, rootOctave, scaleName, synthConfiguration, synthConfigurations } from '../../configurationStore';
import { get } from 'svelte/store';
import type { Control } from '../Control';

const OBJECT_TEXT_CHORD_EMPTY = 'none'
const OBJECT_TEXT_CHORD_EMPTY_COLOR = '#666'

const OBJECT_ROW_COUNT = 8
const OBJECT_WIDTH = DISPLAY_WIDTH / OBJECT_ROW_COUNT
const OBJECT_HEIGHT = 20
const OBJECT_FONT_SIZE = 14

const OBJECT_BACKGROUND = '#000'
const OBJECT_FOREGROUND = '#FFF'
const OBJECT_BORDER = '#444'

class Push2DisplayLabel extends fabric.Group {
  objectRect: fabric.Rect;
  objectLabel: fabric.Text;

  constructor(label: string, row: 'top' | 'bottom', index: number, span?: number) {
    const objectRect = new fabric.Rect({
      fill: OBJECT_BACKGROUND,
      stroke: OBJECT_BORDER,
      originX: 'center',
      originY: 'center',
      width: OBJECT_WIDTH * (span || 1),
      height: OBJECT_HEIGHT
    });

    const objectLabel = new fabric.Text(label, {
      fill: OBJECT_FOREGROUND,
      fontSize: OBJECT_FONT_SIZE,
      originX: 'center',
      originY: 'center'
    });

    super([objectRect, objectLabel], {
      top: row === 'top' ? 0 : DISPLAY_HEIGHT - OBJECT_HEIGHT - 1,
      left: index * OBJECT_WIDTH,
    })

    this.objectRect = objectRect
    this.objectLabel = objectLabel
  }

  get label() {
    return this.objectLabel.get('text')
  }

  setLabel(label: string) {
    this.objectLabel.set('text', label)
  }
  setLabelAnimate(label: string, direction: 'up' | 'down') {
    const distance = direction === 'down' ? OBJECT_HEIGHT / 2 : -OBJECT_HEIGHT / 2

    this.objectLabel.animate('top', distance, {
      duration: 250,
      onChange: this.canvas?.renderAll.bind(this.canvas),
      onComplete: () => {
        this.setLabel(label)
        this.objectLabel.set('top', -distance)
        this.objectLabel.animate('top', 0, {
          duration: 250,
          onChange: this.canvas?.renderAll.bind(this.canvas),
          easing: fabric.util.ease.easeInOutQuint
        });
      },
      easing: fabric.util.ease.easeInOutQuint
    });
  }
}
class Push2DisplayControl extends Push2DisplayLabel {
  constructor(label: string, row: 'top' | 'bottom', control: Control, index: number, span?: number) {
    super(label, row, index, span)

    this.objectRect.set('fill', control.getColor().background)
    this.objectLabel.set('fill', control.getColor().foreground)
    
    control.state.subscribe(() => {
      this.objectRect.set('fill', control.getColor().background)
      this.objectLabel.set('fill', control.getColor().foreground)

      this.canvas?.renderAll()
    })
  }
}

// TODO use colors defined in controlcolors
export class Push2Display {
  private static instance: Push2Display;

  readonly controller: Controller;
  readonly driver: Push2DisplayDriver;
  readonly htmlCanvas: HTMLCanvasElement;
  readonly canvas: fabric.StaticCanvas;

  readonly keyboard: Push2DisplayKeyboard;

  objectTextPrompt: fabric.Text;
  objectTextChord: fabric.Text;

  objectRootLetterLabel: Push2DisplayLabel;
  objectRootOctaveLabel: Push2DisplayLabel;
  objectScaleNameLabel: Push2DisplayLabel;
  objectLayoutGeneratorConfigurationLabel: Push2DisplayLabel;

  objectSynthButtons: Push2DisplayControl[] = [];

  private constructor(controller: Controller, canvas: HTMLCanvasElement) {
    this.controller = controller

    // Canvas
    this.htmlCanvas = canvas
    this.canvas = new fabric.StaticCanvas(this.htmlCanvas, {
      width: DISPLAY_WIDTH,
      height: DISPLAY_HEIGHT,
      backgroundColor: '#191919'
    })

    // Driver
    this.driver = new Push2DisplayDriver(this.htmlCanvas)

    // Base objects
    this.createObjects()

    // Keyboard
    this.keyboard = new Push2DisplayKeyboard(this, 20, 1, DISPLAY_WIDTH - 2, 64, 12);
    this.keyboard.createKeyboard()
  }

  public static getInstance(controller: Controller, canvas: HTMLCanvasElement): Push2Display {
    if (!Push2Display.instance) {
      Push2Display.instance = new Push2Display(controller, canvas);
    }

    return Push2Display.instance;
  }

  async initialize() {
    await this.driver.initialize()

    this.driver.start()

    this.canvas.remove(this.objectTextPrompt)
  }

  private createObjects() {
    this.objectTextPrompt = new fabric.Text('Click to enable Push 2 display', {
      left: 12,
      top: 56,
      fill: '#fff'
    })
    //this.canvas.add(this.objectTextPrompt);

    // Chord name
    this.objectTextChord = new fabric.Text(OBJECT_TEXT_CHORD_EMPTY, {
      left: 8,
      top: 92,
      fill: OBJECT_TEXT_CHORD_EMPTY_COLOR
    })
    this.canvas.add(this.objectTextChord);

    // Root letter button
    this.objectRootLetterLabel = new Push2DisplayLabel(get(rootLetter), 'top', 0, 0.5)
    this.canvas.add(this.objectRootLetterLabel)

    // Root octave button (todo remove -- handled by octave buttons)
    this.objectRootOctaveLabel = new Push2DisplayLabel(String(get(rootOctave)), 'top', 0.5, 0.5)
    this.objectRootOctaveLabel.data = { rootOctave }
    this.canvas.add(this.objectRootOctaveLabel)

    // Scale button
    this.objectScaleNameLabel = new Push2DisplayLabel(get(scaleName), 'top', 1, 2)
    this.canvas.add(this.objectScaleNameLabel)

    // Layout button
    this.objectLayoutGeneratorConfigurationLabel = new Push2DisplayLabel(get(layoutGeneratorConfiguration).getMeta().label, 'top', 3, 2)
    this.canvas.add(this.objectLayoutGeneratorConfigurationLabel)

    // Synth buttons
    for (let i = 0; i < OBJECT_ROW_COUNT; i++) {
      if (synthConfigurations[i]) {
        const groupButton = new Push2DisplayControl(synthConfigurations[i].getMeta().label, 'bottom', this.controller.getControl(`synth${i}`), i)

        this.objectSynthButtons.push(groupButton)
        this.canvas.add(groupButton)
      }
    }

    this.bindEvents()
  }

  private bindEvents() {
    chord.subscribe(chordNotes => {
      this.objectTextChord.set('text',
        chordNotes?.chord.name || OBJECT_TEXT_CHORD_EMPTY
      )
      this.objectTextChord.set('fill',
        chordNotes ? this.controller.pressedColor.background : OBJECT_TEXT_CHORD_EMPTY_COLOR
      )

      this.canvas.renderAll()
    })

    rootLetter.subscribe(rootLetter => {
      this.objectRootLetterLabel.setLabelAnimate(rootLetter, 'down')
    })
    rootOctave.subscribe(rootOctave => {
      if (this.objectRootOctaveLabel.data?.rootOctave < rootOctave) {
        this.objectRootOctaveLabel.setLabelAnimate(String(rootOctave), 'up')
      } else {
        this.objectRootOctaveLabel.setLabelAnimate(String(rootOctave), 'down')
      }

      this.objectRootOctaveLabel.data.rootOctave = rootOctave
    })
    scaleName.subscribe(scaleName => {
      this.objectScaleNameLabel.setLabelAnimate(scaleName, 'down')
    })
    layoutGeneratorConfiguration.subscribe(layoutGeneratorConfiguration => {
      this.objectLayoutGeneratorConfigurationLabel.setLabelAnimate(layoutGeneratorConfiguration.getMeta().label, 'down')
    })
  }
}