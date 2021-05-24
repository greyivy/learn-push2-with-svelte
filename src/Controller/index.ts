import { Writable, writable } from 'svelte/store'
import type { Note } from '@tonaljs/core'
import type { Scale } from "@tonaljs/scale";
import { get as getScale } from "@tonaljs/scale";
import WebMidi, { Input, Output } from 'webmidi'
import { Pad, PadNote } from '../Pad'
import type { PadColor, PadColorCollection, PadNoteColorCollection } from '../PadColor'
import type { Synth } from '../Synth'
import type { LayoutGenerator } from '../LayoutGenerator'
import type { SvelteComponent } from 'svelte'

export type ControllerConfiguration = typeof Controller & { getMeta(): ControllerMeta, getInstance(): Controller }

export type ControllerMeta = {
  id: string;
  label: string;
  component: typeof SvelteComponent;
}

type PadCollection = {
  [padNumber: number]: Pad
}

export abstract class Controller {
  readonly rows: number;
  readonly columns: number;
  readonly offset: number;

  scaleName: string;

  input: Input | false;
  output: Output | false;
  synth: Synth;

  private readonly noteState: Set<Note>;
  readonly notes: Writable<Set<Note>>;
  readonly pads: PadCollection;

  /**
   * Creates an instance of Controller.
   * @param {*} offset number of bottom-left pad
   * @memberof Controller
   */
  constructor(
    rows: number,
    columns: number,
    offset: number
  ) {
    this.rows = rows
    this.columns = columns
    this.offset = offset

    this.noteState = new Set()
    this.notes = writable(new Set())

    this.pads = {}
    for (let i = 0; i < rows * columns; i++) {
      const padNumber = i + offset

      this.pads[padNumber] = new Pad(
        this,
        padNumber
      )
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
  }

  on(note: Note, velocity: number) {
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
  off(note: Note) {
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

    this.input = WebMidi.getInputById(inputId)
    this.output = WebMidi.getOutputById(outputId)

    if (this.input) {
      this.input.addListener('noteon', 'all', e => {
        const pad = this.pads[e.note.number]
        this.on(pad.note, e.velocity)
      })
      this.input.addListener('noteoff', 'all', e => {
        const pad = this.pads[e.note.number]
        this.off(pad.note)
      })
    }
  }

  setSynth(synth: Synth) {
    this.synth = synth
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

  destroy(): void {
    if (this.input) {
      this.input.removeListener()
    }
  }
}
