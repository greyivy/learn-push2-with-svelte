import { writable, Writable } from "svelte/store";
import type { Controller } from ".";
import type { VelocityColor } from "./VelocityColor";

export type ControlType =
    "rootLetter" | "rootOctave" | "rootOctaveUp" | "rootOctaveDown" |
    "scaleName" | "layoutGeneratorConfiguration" | "synthConfiguration" |
    string

export type ControlState = "on" | "off" | string

export type ControlDefinition = {
    controlNumber: number,
    controlType: ControlType,
    initialColor?: VelocityColor,
    fireAllEvents?: boolean // Whether to fire events for when the velocity is 0
}

export class Control {
    readonly controller: Controller;
    readonly controlNumber: number;
    readonly controlType: ControlType;
    fireAllEvents: boolean;

    overrideColor: VelocityColor;

    private stateState: ControlState = "on";
    readonly state: Writable<ControlState> = writable(this.stateState);

    constructor(controller: Controller, definition: ControlDefinition) {
        const { controlNumber, controlType, initialColor: overrideColor, fireAllEvents } = definition

        this.controller = controller

        this.controlNumber = controlNumber
        this.controlType = controlType
        this.overrideColor = overrideColor
        this.fireAllEvents = fireAllEvents
    }

    getColor() {
        return this.overrideColor || this.controller.controlColors[this.stateState]
    }
    setColor(color?: VelocityColor) {
        this.overrideColor = color
        this.draw()
    }

    setStateOn() {
        this.setState('on')
    }
    setStateOff() {
        this.setState('off')
    }
    setState(state: string) {
        this.stateState = state
        this.state.set(this.stateState)
        this.draw()
    }

    draw() {
        if (this.getColor()) {
            if (this.controller.output) {
                this.controller.output.sendControlChange(this.controlNumber, this.getColor().velocity)
            }
        } else {
            console.warn(`No color for controller state "${this.state}"`)
        }
    }
}