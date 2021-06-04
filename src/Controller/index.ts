import { Writable, writable } from 'svelte/store'
import { note, Note } from '@tonaljs/core'
import type { Scale } from "@tonaljs/scale";
import { get as getScale } from "@tonaljs/scale";
import webmidi, { Input, InputEventControlchange, Output } from 'webmidi'
import { Pad, PadNote } from './Pad'
import type { VelocityColor, VelocityColorCollection, NoteNumberVelocityColorCollection, ControlVelocityColorCollection } from './VelocityColor'
import type { Synth } from '../Synth'
import { enharmonic } from "@tonaljs/note";
import type { LayoutGenerator } from '../LayoutGenerator'
import type { SvelteComponent } from 'svelte'
import { layoutGeneratorConfiguration, layoutGeneratorConfigurations, rootLetter, rootOctave, scaleName, scaleNames, synthConfiguration, synthConfigurations } from '../configurationStore';
import { MAX_OCTAVE, MIN_OCTAVE, NOTES, OCTAVES } from '../helpers';
import { Control, ControlDefinition, ControlType } from './Control';

export type ControllerConfiguration = typeof Controller & { getMeta(): ControllerMeta, getInstance(): Controller }

export type ControllerMeta = {
  id: string;
  label: string;
  component: typeof SvelteComponent;
}

export type PadCollection = {
  [padNumber: number]: Pad
}

export type ControlCollection = {
  [controlNumber: number]: Control
}

export type EventType = "layoutChange" | ControlType

export function getNext(value: any, values: any[]) {
  if (values.indexOf(value) === values.length - 1) {
    return values[0]
  } else {
    return values[values.indexOf(value) + 1]
  }
}
export function getPrevious(value: any, values: any[]) {
  if (values.indexOf(value) === 0) {
    return values[values.length - 1]
  } else {
    return values[values.indexOf(value) - 1]
  }
}

export abstract class Controller {
  readonly rows: number;
  readonly columns: number;
  readonly offset: number;

  readonly eventTarget: EventTarget;
  readonly addEventListener: (type: EventType, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void;
  readonly removeEventListener: (type: EventType, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void;
  private readonly dispatchEvent: (event: Event) => boolean;

  scaleName: string;

  input: Input;
  output: Output;
  synth: Synth;

  private readonly notesPressedState: Note[] = [];
  readonly notesPressed: Writable<Note[]> = writable([]);

  private notesHighlightedState: Note[] = [];
  readonly notesHighlighted: Writable<Note[]> = writable([]);

  private notesHoveredState: Note[] = [];
  readonly notesHovered: Writable<Note[]> = writable([]);

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

    for (let i = 0; i < rows * columns; i++) {
      const padNumber = i + offset

      this.pads[padNumber] = new Pad(
        this,
        padNumber
      )
    }

    for (const control of controls) {
      this.controls[control.controlNumber] = new Control(this, control)
    }
  }

  abstract colors: VelocityColorCollection;
  abstract noteColors: NoteNumberVelocityColorCollection;
  abstract pressedColor: VelocityColor;
  abstract highlightColor: VelocityColor;
  abstract hoverColor: VelocityColor;
  abstract controlColors: ControlVelocityColorCollection;

  get padCount(): number {
    return this.rows * this.columns
  }

  getPadsByNote(note: Note): Pad[] {
    return Object.values(this.pads).filter(pad => pad.getNote() === note)
  }
  getPadByIndex(index: number): Pad {
    return this.pads[this.offset + index]
  }
  getPadNotes(): Note[] {
    return Object.values(this.pads).map(pad => pad.getNote())
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

  // Maps pad numbers to notes
  setLayoutGenerator(layoutGenerator: LayoutGenerator, scaleName) {
    this.scaleName = scaleName

    const layout = layoutGenerator.generate(this)

    // Compute scale
    const scale = getScale(`${layoutGenerator.root.pc}0 ${this.scaleName}`)
    const scaleNoteLetters = scale.notes.map(noteName => {
      const noteLetter = note(noteName).pc

      if (NOTES.includes(noteLetter)) {
        return noteLetter
      } else {
        // If the note isn't in our note list, use the enharmonic (which should be)
        return note(enharmonic(noteName)).pc
      }
    })

    for (let i = 0; i < this.padCount; i++) {
      const padNumber = i + this.offset

      const note = layout[padNumber] as PadNote

      note.noteNumber = scaleNoteLetters.indexOf(note.pc) + 1

      this.pads[padNumber].setNote(note)
    }

    this.draw()

    this.dispatchEvent(new CustomEvent('layoutChange'))
  }

  noteOn(note: Note, velocity: number) {
    if (!this.notesPressedState.includes(note)) {
      this.notesPressedState.push(note)
      this.notesPressed.set(this.notesPressedState)

      this.synth.down(note, velocity)
    }
  }
  noteOff(note: Note) {
    if (this.notesPressedState.includes(note)) {
      this.notesPressedState.splice(this.notesPressedState.indexOf(note), 1)
      this.notesPressed.set(this.notesPressedState)

      this.synth.up(note)
    }
  }

  hoverNoteOn(note: Note) {
    if (!this.notesHoveredState.includes(note)) {
      this.notesHoveredState.push(note)
      this.notesHovered.set(this.notesHoveredState)
    }
  }
  hoverNoteOff(note: Note) {
    if (this.notesHoveredState.includes(note)) {
      this.notesHoveredState.splice(this.notesHoveredState.indexOf(note), 1)
      this.notesHovered.set(this.notesHoveredState)
    }
  }

  highlightNotes(notes: Note[]): void {
    this.notesHighlightedState = notes
    this.notesHighlighted.set(this.notesHighlightedState)
  }
  highlightClear(): void {
    this.notesHighlightedState = []
    this.notesHighlighted.set(this.notesHighlightedState)
  }

  getControl(controlType: ControlType) {
    return Object.values(this.controls).find(control => control.controlType === controlType)
  }

  private bindControlEvents() {
    this.addEventListener('rootLetter', () => {
      rootLetter.update(rootLetter => getNext(rootLetter, NOTES))
    })

    this.addEventListener('rootOctave', () => rootOctave.update(rootOctave => getNext(rootOctave, OCTAVES)))
    this.addEventListener('rootOctaveUp', () => rootOctave.update(rootOctave => rootOctave < MAX_OCTAVE ? rootOctave + 1 : rootOctave))
    this.addEventListener('rootOctaveDown', () => rootOctave.update(rootOctave => rootOctave > MIN_OCTAVE ? rootOctave - 1 : rootOctave))

    // Illuminate octave up/down controls
    rootOctave.subscribe(octave => {
      // Reset pressed, hovered state
      for (const note of this.notesPressedState) {
        this.noteOff(note)
      }
      this.notesHoveredState = []
      this.notesPressed.set(this.notesPressedState)

      const controlOctaveUp = this.getControl('rootOctaveUp')
      const controlOctaveDown = this.getControl('rootOctaveDown')

      if (controlOctaveUp && controlOctaveDown) {
        if (octave === MAX_OCTAVE) {
          controlOctaveUp.setStateOff()
        } else {
          controlOctaveUp.setStateOn()
        }
        if (octave === MIN_OCTAVE) {
          controlOctaveDown.setStateOff()
        } else {
          controlOctaveDown.setStateOn()
        }
      }
    })

    this.addEventListener('scaleName', () => {
      scaleName.update(scaleName => getNext(scaleName, scaleNames))
    })

    this.addEventListener('layoutGeneratorConfiguration', () => {
      layoutGeneratorConfiguration.update(layoutGeneratorConfiguration => getNext(layoutGeneratorConfiguration, layoutGeneratorConfigurations))
    })

    this.addEventListener('synthConfiguration', () => {
      synthConfiguration.update(synthConfiguration => getNext(synthConfiguration, synthConfigurations))
    })
  }

  draw(): void {
    for (const pad of Object.values(this.pads)) {
      pad.draw()
    }
    for (const control of Object.values(this.controls)) {
      control.draw()
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
        if (pad) {
          this.noteOn(pad.getNote(), e.velocity)
        }
      })
      this.input.addListener('noteoff', 'all', e => {
        const pad = this.pads[e.note.number]
        if (pad) {
          this.noteOff(pad.getNote())
        }
      })

      this.input.addListener('controlchange', "all", e => {
        const control = this.controls[e.controller.number]
        if (control) {
          if (control.fireAllEvents || e.value > 0) {
            this.dispatchEvent(new CustomEvent<{ event: InputEventControlchange, control: Control }>(control.controlType, {
              detail: {
                event: e,
                control
              }
            }))
          }
        } else {
          console.warn('Control not bound', e)
        }
      });

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

  destroy(): void {
    if (this.input) {
      this.input.removeListener()
    }
  }
}
