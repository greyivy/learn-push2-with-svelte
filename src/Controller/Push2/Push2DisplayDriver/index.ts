//@ts-ignore
import python from "./calculations.py";

import "w3c-web-usb/index";

export const DISPLAY_WIDTH = 960
export const DISPLAY_HEIGHT = 160

const ABLETON_VENDOR_ID = 0x2982
const PUSH2_PRODUCT_ID = 0x1967

type WorkerAction = "initializeUSB" | "initializePython" | "drawFrame" | "drawBlackFrame"
type WorkerResponse = {
    success: boolean,
    returnValue?: any,
    error?: any
}

export class Push2DisplayDriver {
    worker: Worker;
    device: USBDevice;
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

    private _isDrawing: boolean;
    public get isDrawing(): boolean {
        return this._isDrawing;
    }

    constructor(canvas: HTMLCanvasElement | OffscreenCanvas) {
        canvas.width = DISPLAY_WIDTH
        canvas.height = DISPLAY_HEIGHT

        this.context = canvas.getContext('2d')
        this.worker = new Worker('./worker.js')
    }

    async initialize() {
        await this.initializeUSB()
        await this.initializePython()

        try {
            // Test everything by sending a blank frame
            await this.callWorkerAsync('drawBlackFrame');
        } catch (e) {
            throw new Error(`Error sending test frame: ${e.message}`)
        }
    }

    private async initializePython() {
        await this.callWorkerAsync('initializePython', {
            python
        });
    }
    private async initializeUSB() {
        try {
            this.device = await navigator.usb
                .requestDevice({ filters: [{ vendorId: ABLETON_VENDOR_ID, productId: PUSH2_PRODUCT_ID }] })

            await this.callWorkerAsync('initializeUSB', {
                vendorId: this.device.vendorId,
                productId: this.device.productId,
            });
        } catch (e) {
            throw new Error(`USB connection error: ${e.message}`)
        }
    }

    private async drawLoop() {
        // Draw as fast as possible (the Push 2 can hit 60fps, our browser almost certainly cannot)
        while (this._isDrawing) {
            const imageData = this.context.getImageData(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);

            await this.callWorkerAsync('drawFrame', {
                frame: imageData.data
            });
        }

        // Blank the screen
        await this.callWorkerAsync('drawBlackFrame');
    }

    start() {
        this._isDrawing = true
        this.drawLoop()
    }

    stop() {
        this._isDrawing = false
    }

    dispose() {
        this.stop();

        (async () => {
            await this.device.releaseInterface(0)
            await this.device.close()
        })()
    }

    callWorker(context, onSuccess, onError) {
        this.worker.onerror = onError;
        this.worker.onmessage = (e) => {
            const response = e.data as WorkerResponse
            response.success ? onSuccess(response.returnValue) : onError(response.error);
        }
        this.worker.postMessage(context);
    }
    async callWorkerAsync(action: WorkerAction, context?: any) {
        return new Promise((onSuccess, onError) => {
            this.callWorker({ ...context, action }, onSuccess, onError);
        });
    }
}