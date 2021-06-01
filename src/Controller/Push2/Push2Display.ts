import { Push2DisplayDriver } from './Push2DisplayDriver'
import { DISPLAY_WIDTH, DISPLAY_HEIGHT } from './Push2DisplayDriver'
import { fabric } from 'fabric'
import type { Controller } from '..';
import { chord } from '../../ChordHistory/chordStore'

const OBJECT_TEXT_CHORD_EMPTY = 'none'

export class Push2Display {
  private static instance: Push2Display;

  controller: Controller;
  driver: Push2DisplayDriver
  htmlCanvas: HTMLCanvasElement
  canvas: fabric.StaticCanvas

  objectTextPrompt: fabric.Text;
  objectTextChord: fabric.Text;

  private constructor(controller: Controller, canvas: HTMLCanvasElement) {
    this.controller = controller

    this.htmlCanvas = canvas
    this.canvas = new fabric.StaticCanvas(this.htmlCanvas, {
      width: DISPLAY_WIDTH,
      height: DISPLAY_HEIGHT
    })

    this.driver = new Push2DisplayDriver(this.htmlCanvas)

    this.createObjects()

    chord.subscribe(chordNotes => {
      this.objectTextChord.set('text',
        chordNotes?.chord.name || OBJECT_TEXT_CHORD_EMPTY
      )
      this.canvas.renderAll()
    })
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

  createObjects() {
    this.objectTextPrompt = new fabric.Text('Click to enable Push 2 display', {
      left: 10,
      top: 50,
      fill: '#fff'
    })
    this.canvas.add(this.objectTextPrompt);

    this.objectTextChord = new fabric.Text(OBJECT_TEXT_CHORD_EMPTY, {
      left: 10,
      top: 10,
      fill: '#fff'
    })

    this.canvas.add(this.objectTextChord);
  }
}