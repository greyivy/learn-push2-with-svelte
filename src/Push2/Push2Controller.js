import { Controller } from '../Controller'

class Push2Controller extends Controller {
  constructor (layoutGenerator, inputId, outputId, synth) {
    super(8, 8, 36, layoutGenerator, inputId, outputId, synth)
  }
}

export default Push2Controller
