import type { Controller } from ".";

export type ControlType = "octaveUp" | "octaveDown" | string

const OFF_COLOR_VELOCITY = 0
const DEFAULT_COLOR_VELOCITY = 127

export class Control {
    readonly controller: Controller;
    readonly controlNumber: number;
    readonly controlType: ControlType;

    colorVelocity: number;
    private previousColorVelocity: number;

    constructor(controller: Controller, controlNumber: number, controlType: ControlType, initialColorVelocity?: number) {
        this.controller = controller
        this.controlNumber = controlNumber
        this.controlType = controlType

        this.setColor(initialColorVelocity || DEFAULT_COLOR_VELOCITY)
    }

    setColor(velocity: number) {
        this.colorVelocity = velocity
        this.draw()
    }

    // Helper methods to turn control illumination on and off
    setOn() {
        this.setColor(this.previousColorVelocity || DEFAULT_COLOR_VELOCITY)
    }
    setOff() {
        if (this.colorVelocity !== OFF_COLOR_VELOCITY) {
            this.previousColorVelocity = this.colorVelocity
        }

        this.setColor(0)
    }

    draw() {
        if (this.controller.output) {
            this.controller.output.sendControlChange(this.controlNumber, this.colorVelocity)
        }
    }
}