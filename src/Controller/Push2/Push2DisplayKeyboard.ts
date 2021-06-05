import type { Push2Display } from "./Push2Display";

import { fabric } from 'fabric'

import type { Note } from '@tonaljs/core'
import { note } from '@tonaljs/core'
import { NOTES, MIN_OCTAVE } from '../../helpers'

const WHITE_KEY_COUNT = 52 // There are 52 white keys on a 88 key keyboard
const FIRST_OCTAVE = MIN_OCTAVE // 88 key keyboard starts at 0
const FIRST_NOTE = 'A' // 88 key keyboard starts at A

const WHITE_KEY_BACKGROUND = '#fff'
const BLACK_KEY_BACKGROUND = '#000'
const BOUNDARY_FILL = 'rgba(0,0,0,0.5)'
const KEY_BORDER = '#444'
const LABEL_COLOR = '#ff0000'

type KeyData = {
    type: 'white' | 'black',
    pressed: boolean,
    highlighted: boolean,
    hovered: boolean
}

export class Push2DisplayKeyboard {
    readonly display: Push2Display;
    readonly top: number;
    readonly left: number;
    readonly width: number;
    readonly height: number;

    readonly fontSize: number;

    readonly whiteKeyWidth: number;
    readonly whiteKeyHeight: number;

    readonly blackKeyWidth: number;
    readonly blackKeyHeight: number;

    private notesPressedPrevious: Note[] = []
    private notesHighlightedPrevious: Note[] = []
    private notesHoveredPrevious: Note[] = []

    objectKeys: {
        [noteName: string]: fabric.Rect
    } = {}

    objectMinBoundary: fabric.Rect
    objectMaxBoundary: fabric.Rect

    constructor(display: Push2Display, top: number, left: number, width: number, height: number, fontSize: number) {
        this.display = display;

        this.top = top;
        this.left = left;
        this.width = width;
        this.height = height;

        this.fontSize = fontSize;

        this.whiteKeyWidth = width / WHITE_KEY_COUNT
        this.whiteKeyHeight = height

        this.blackKeyWidth = (this.whiteKeyWidth / 3) * 2
        this.blackKeyHeight = (this.whiteKeyHeight / 3) * 2
    }

    private getBoundaryKeys() {
        const padNotes = Object.values(this.display.controller.getPadNotes())
        const objectKeysValues = Object.values(this.objectKeys)

        const minNoteName = padNotes[0].name
        const maxNoteName = padNotes[padNotes.length - 1].name

        return {
            minKey: this.objectKeys[minNoteName] || objectKeysValues[0],
            maxKey: this.objectKeys[maxNoteName] || objectKeysValues[objectKeysValues.length - 1]
        }
    }

    createKeyboard() {
        let currentOctave = FIRST_OCTAVE // 88 key keyboard starts at 0
        let currentNoteIndex = NOTES.indexOf(FIRST_NOTE)

        let currentWhiteKeyIndex = 0

        const whiteKeyObjects = []
        const blackKeyObjects = []

        const labelObjects = []

        while (currentWhiteKeyIndex < WHITE_KEY_COUNT) {
            const currentNote = note(`${NOTES[currentNoteIndex]}${currentOctave}`) as Note

            if (currentNote.alt === 0) { // White keys
                const offset = this.left + (currentWhiteKeyIndex * this.whiteKeyWidth)

                const key = new fabric.Rect({
                    left: offset,
                    top: this.top,
                    width: this.whiteKeyWidth,
                    height: this.whiteKeyHeight,
                    fill: WHITE_KEY_BACKGROUND,
                    stroke: KEY_BORDER,
                    data: {
                        type: 'white',
                        pressed: false,
                        highlighted: false,
                        hovered: false
                    }
                })
                this.objectKeys[currentNote.name] = key
                whiteKeyObjects.push(key)

                labelObjects.push(new fabric.Textbox(currentNote.name, {
                    left: offset,
                    top: this.top + this.whiteKeyHeight - (this.fontSize + this.fontSize / 6),
                    width: this.whiteKeyWidth,
                    textAlign: 'center',
                    fontSize: this.fontSize,
                    fill: LABEL_COLOR
                }))

                currentWhiteKeyIndex++
            } else {
                const offset = this.left + (currentWhiteKeyIndex * this.whiteKeyWidth) - (this.blackKeyWidth / 2)

                const key = new fabric.Rect({
                    left: offset,
                    top: this.top,
                    width: this.blackKeyWidth,
                    height: this.blackKeyHeight,
                    fill: BLACK_KEY_BACKGROUND,
                    stroke: KEY_BORDER,
                    data: {
                        type: 'black',
                        pressed: false,
                        highlighted: false,
                        hovered: false
                    }
                })
                this.objectKeys[currentNote.name] = key
                blackKeyObjects.push(key)
            }

            if (currentNoteIndex < NOTES.length - 1) {
                currentNoteIndex++
            } else {
                currentNoteIndex = 0
                currentOctave++
            }
        }

        const { minKey, maxKey } = this.getBoundaryKeys()

        this.objectMinBoundary = new fabric.Rect({
            left: this.left,
            top: this.top,
            width: minKey.left - this.left,
            height: this.height,
            fill: BOUNDARY_FILL
        })
        this.objectMaxBoundary = new fabric.Rect({
            left: maxKey.left + maxKey.width,
            top: this.top,
            width: this.width - maxKey.left,
            height: this.height,
            fill: BOUNDARY_FILL
        })

        this.display.canvas.add(...whiteKeyObjects, ...blackKeyObjects, ...labelObjects, this.objectMinBoundary, this.objectMaxBoundary)

        this.bindEvents()
    }

    private bindEvents() {
        this.display.controller.addEventListener('layoutChange', () => {
            // Get all pad notes
            const { minKey, maxKey } = this.getBoundaryKeys()

            const animateParams = {
                duration: 250,
                onChange: this.display.canvas.renderAll.bind(this.display.canvas)
            }

            this.objectMinBoundary.animate('width', minKey.left - this.left, animateParams);
            this.objectMaxBoundary.animate('left', maxKey.left + maxKey.width, animateParams);
            this.objectMaxBoundary.animate('width', this.width - maxKey.left, animateParams);

            this.draw()
        })

        this.display.controller.notesPressed.subscribe(notesOn => {
            let notesOff = this.notesPressedPrevious.filter(note => !notesOn.includes(note));

            this.setKeyData(notesOff, {
                pressed: false
            })
            this.setKeyData(notesOn, {
                pressed: true
            })

            this.draw()

            this.notesPressedPrevious = [...notesOn]
        })
        this.display.controller.notesHighlighted.subscribe(notesOn => {
            let notesOff = this.notesHighlightedPrevious.filter(note => !notesOn.includes(note));

            this.setKeyData(notesOff, {
                highlighted: false
            })
            this.setKeyData(notesOn, {
                highlighted: true
            })

            this.draw()

            this.notesHighlightedPrevious = [...notesOn]
        })
        this.display.controller.notesHovered.subscribe(notesOn => {
            let notesOff = this.notesHoveredPrevious.filter(note => !notesOn.includes(note));

            this.setKeyData(notesOff, {
                hovered: false
            })
            this.setKeyData(notesOn, {
                hovered: true
            })

            this.draw()

            this.notesHoveredPrevious = [...notesOn]
        })
    }

    /**
     * Note: don't forget to call draw()
     *
     * @memberof Push2DisplayKeyboard
     */
    setKeyData(notes: Note[], data: Partial<KeyData>) {
        for (const note of notes) {
            const key = this.objectKeys[note.name]
            if (key) {
                key.dirty = true
                key.data = {
                    ...key.data,
                    ...data
                }
            }
        }
    }
    setAllKeyData(data: Partial<KeyData>) {
        for (const key of Object.values(this.objectKeys)) {
            key.dirty = true
            key.data = {
                ...key.data,
                ...data
            }
        }
    }

    draw() {
        for (const key of Object.values(this.objectKeys)) {
            if (key.dirty) {
                const data = key.data as KeyData

                //key.opacity = data.pad ? PAD_OPACITY : NO_PAD_OPACITY

                if (data.pressed) {
                    key.fill = this.display.controller.pressedColor.background
                } else if (data.hovered) {
                    key.fill = this.display.controller.hoverColor.background
                } else if (data.highlighted) {
                    key.fill = this.display.controller.highlightColor.background
                } else {
                    key.fill = data.type === 'white' ?
                        WHITE_KEY_BACKGROUND : BLACK_KEY_BACKGROUND
                }
            }
        }

        this.display.canvas.renderAll()
    }
}