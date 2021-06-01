// Pyodide loader
importScripts('https://cdn.jsdelivr.net/pyodide/v0.17.0/full/pyodide.js')

async function loadPyodideAndPackages () {
  await loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.17.0/full/'
  })
  await self.pyodide.loadPackage(['numpy'])
}
let pyodideReadyPromise = loadPyodideAndPackages()

const DISPLAY_FRAME_HEADER = new Uint8Array([
  0xff,
  0xcc,
  0xaa,
  0x88,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00
])

self.drawFrame = async frame => {
  await self.device.transferOut(1, DISPLAY_FRAME_HEADER)
  await self.device.transferOut(1, frame.toJs())
}

self.onmessage = async event => {
  const { action, ...context } = event.data

  let returnValue = null

  try {
    switch (action) {
      // Load Python script
      case 'initializePython':
        // Ensure loading is done
        await pyodideReadyPromise

        await self.pyodide.runPythonAsync(context.python)
        break

      // Open the device specified with vendorId and productId
      case 'initializeUSB':
        const devices = await navigator.usb.getDevices()

        for (let device of devices) {
          if (
            device.vendorId === context.vendorId &&
            device.productId === context.productId
          ) {
            self.device = device
            await self.device.open()

            await self.device.selectConfiguration(1)
            await self.device.claimInterface(0)

            break
          }
        }

        break

      // Draw frame (using ImageData array format)
      case 'drawFrame':
        self.drawFrame(
          await pyodide.globals.get('prepare_frame')(context.frame, 'imagedata')
        )

        break

      // Draw black frame
      case 'drawBlackFrame':
        await self.drawFrame(await pyodide.globals.get('prepare_black_frame')())

        break
    }

    postMessage({
      success: true,
      returnValue
    })
  } catch (error) {
    postMessage({ success: false, error })
  }
}
