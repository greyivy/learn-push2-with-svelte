import { Writable, writable } from 'svelte/store'
import type { Note } from '@tonaljs/core'
import type { Scale } from "@tonaljs/scale";
import { get as getScale } from "@tonaljs/scale";
import webmidi, { Input, InputEventControlchange, Output } from 'webmidi'
import { Pad, PadNote } from './Pad'
import type { PadColor, PadColorCollection, PadNoteColorCollection } from './PadColor'
import type { Synth } from '../Synth'
import type { LayoutGenerator } from '../LayoutGenerator'
import type { SvelteComponent } from 'svelte'
import { rootOctave } from '../configurationStore';
import { OCTAVES } from '../helpers';
import { Control, ControlType } from './Control';

const MAX_OCTAVE = Math.max(...OCTAVES)
const MIN_OCTAVE = Math.min(...OCTAVES)

export type ControllerConfiguration = typeof Controller & { getMeta(): ControllerMeta, getInstance(): Controller }

export type ControllerMeta = {
  id: string;
  label: string;
  component: typeof SvelteComponent;
}

type PadCollection = {
  [padNumber: number]: Pad
}

type ControlCollection = {
  [controlNumber: number]: Control
}

export type ControlDefinition = {
  controlNumber: number,
  controlType: ControlType,
  initialColorVelocity?: number
}

export abstract class Controller {
  readonly rows: number;
  readonly columns: number;
  readonly offset: number;

  readonly eventTarget: EventTarget;
  readonly addEventListener: (type: ControlType, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void;
  readonly removeEventListener: (type: ControlType, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void;
  private readonly dispatchEvent: (event: Event) => boolean;

  scaleName: string;

  input: Input;
  output: Output;
  synth: Synth;

  private readonly noteState: Set<Note>;
  readonly notes: Writable<Set<Note>>;
  readonly pads: PadCollection = {};
  readonly controls: ControlCollection = {};

  /**
   * Creates an instance of Controller.
   * @param {*} offset number of bottom-left pad
   * @memberof Controller
   */
  constructor(
    rows: number,
    columns: number,
    offset: number,
    controls: ControlDefinition[]
  ) {
    this.rows = rows
    this.columns = columns
    this.offset = offset

    this.eventTarget = document.createTextNode(null)
    this.addEventListener = this.eventTarget.addEventListener.bind(this.eventTarget)
    this.removeEventListener = this.eventTarget.removeEventListener.bind(this.eventTarget)
    this.dispatchEvent = this.eventTarget.dispatchEvent.bind(this.eventTarget)

    this.bindControlEvents()

    this.noteState = new Set()
    this.notes = writable(new Set())

    for (let i = 0; i < rows * columns; i++) {
      const padNumber = i + offset

      this.pads[padNumber] = new Pad(
        this,
        padNumber
      )
    }

    for (const control of controls) {
      this.controls[control.controlNumber] = new Control(this, control.controlNumber, control.controlType, control.initialColorVelocity)
    }
  }

  abstract padColors: PadColorCollection;
  abstract defaultPadNoteColors: PadNoteColorCollection;
  abstract defaultPadPressedColor: PadColor;
  abstract defaultPadHighlightColor: PadColor;
  abstract defaultPadHoverColor: PadColor;

  getPadsByNote(note: Note): Pad[] {
    return Object.values(this.pads).filter(pad => pad.note === note)
  }
  getPadByIndex(index: number): Pad {
    return this.pads[this.offset + index]
  }

  // Returns 3D array of pad numbers
  getLayout(): number[][] {
    let layout: number[][] = []

    let padNumber = this.offset
    for (let r = 0; r < this.rows; r++) {
      let layoutRow: number[] = []

      for (let c = 0; c < this.columns; c++) {
        layoutRow.push(padNumber)
        padNumber++
      }

      layout = [layoutRow, ...layout]
    }

    return layout
  }

  setLayoutGenerator(layoutGenerator: LayoutGenerator, scaleName) {
    this.scaleName = scaleName

    const layout = layoutGenerator.generate(this)

    // Compute scale
    const scales: { [octave: number]: Scale } = {}
    for (let i = 0; i < this.rows * this.columns; i++) {
      const padNumber = i + this.offset

      const note = layout[padNumber] as PadNote
      if (!scales[note.oct]) {
        scales[note.oct] = getScale(`${layoutGenerator.root.pc}${note.oct} ${this.scaleName}`)
      }

      note.noteNumber = scales[note.oct].notes.indexOf(note.name) + 1

      this.pads[padNumber].setNote(note)
    }

    this.draw()
  }

  noteOn(note: Note, velocity: number) {
    if (!this.noteState.has(note)) {

      this.noteState.add(note)
      this.notes.set(this.noteState)

      const pads = this.getPadsByNote(note)
      for (const pad of pads) {
        pad.on()
      }
      this.synth.down(note, velocity)
    }
  }
  noteOff(note: Note) {
    if (this.noteState.has(note)) {
      this.noteState.delete(note)
      this.notes.set(this.noteState)

      const pads = this.getPadsByNote(note)
      for (const pad of pads) {
        pad.off()
      }
      this.synth.up(note)
    }
  }

  setDevices(inputId: string, outputId: string) {
    if (this.input) {
      this.input.removeListener()
    }

    this.input = webmidi.getInputById(inputId) as Input
    this.output = webmidi.getOutputById(outputId) as Output

    if (this.input && this.output) {
      this.input.addListener('noteon', 'all', e => {
        const pad = this.pads[e.note.number]
        this.noteOn(pad.note, e.velocity)
      })
      this.input.addListener('noteoff', 'all', e => {
        const pad = this.pads[e.note.number]
        this.noteOff(pad.note)
      })

      this.input.addListener('controlchange', "all",
        (e) => {
          if (e.value > 0) {
            // Pad down
            const controlNumber = e.controller.number

            if (this.controls[controlNumber]) {
              this.dispatchEvent(new CustomEvent<InputEventControlchange>(this.controls[controlNumber].controlType, {
                detail: e
              }))
            }
          } else {
            // Pad up
          }
        }
      );

      /* 
      this.input.addListener('pitchbend', 'all',
        function (e) {
          console.log("Received 'pitchbend' message.", e);
        }
      );
      this.input.addListener('programchange', "all",
        function (e) {
          console.log("Received 'programchange' message.", e);
        }
      );
      this.input.addListener('nrpn', "all",
        function (e) {
          if (e.controller.type === 'entry') {
            console.log("Received 'nrpn' 'entry' message.", e);
          }
          if (e.controller.type === 'decrement') {
            console.log("Received 'nrpn' 'decrement' message.", e);
          }
          if (e.controller.type === 'increment') {
            console.log("Received 'nrpn' 'increment' message.", e);
          }
          console.log("message value: " + e.controller.value + ".", e);
        }
      );*/
    }

    this.draw()
  }

  setSynth(synth: Synth) {
    this.synth = synth
  }

  getControl(controlType: ControlType) {
    return Object.values(this.controls).find(control => control.controlType === controlType)
  }

  private bindControlEvents() {
    this.addEventListener('octaveUp', () => rootOctave.update(o => o < MAX_OCTAVE ? o + 1 : o)) // Octave up
    this.addEventListener('octaveDown', () => rootOctave.update(o => o > MIN_OCTAVE ? o - 1 : o)) // Octave down
    // Illuminate octave controls
    rootOctave.subscribe(octave => {
      const controlOctaveUp = this.getControl('octaveUp')
      const controlOctaveDown = this.getControl('octaveDown')

      if (controlOctaveUp && controlOctaveDown) {
        if (octave === MAX_OCTAVE) {
          controlOctaveUp.setOff()
        } else {
          controlOctaveUp.setOn()
        }
        if (octave === MIN_OCTAVE) {
          controlOctaveDown.setOff()
        } else {
          controlOctaveDown.setOn()
        }
      }
    })
  }

  highlightNotes(notes: Note[]): void {
    for (const note of notes) {
      const pads = this.getPadsByNote(note)
      for (const pad of pads) {
        pad.highlight()
      }
    }
  }

  highlightClear(): void {
    for (const pad of Object.values(this.pads)) {
      pad.unhighlight()
    }
  }

  draw(): void {
    for (const pad of Object.values(this.pads)) {
      pad.draw()
    }
    for (const control of Object.values(this.controls)) {
      control.draw()
    }
  }

  destroy(): void {
    if (this.input) {
      this.input.removeListener()
    }
  }
}
