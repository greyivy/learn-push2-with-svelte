import {
    SynthAM,
    SynthBasic,
    SynthFM,
    SynthNoise,
} from "./Synth/SynthTone";
import { Writable, writable } from 'svelte/store';

import type { ControllerConfiguration } from './Controller';
import { LayoutGeneratorAbleton4ths } from './LayoutGenerator/LayoutGeneratorAbleton';
import type { LayoutGeneratorConfiguration } from './LayoutGenerator';
import { LayoutGeneratorSequential } from './LayoutGenerator/LayoutGeneratorSequential';
import Push2Controller from './Controller/Push2/Push2Controller';
import { Scale } from "@tonaljs/tonal";
import type { SynthConfiguration } from "./Synth";
import SynthPiano from './Synth/SynthPiano';

// TODO move localStorage stuff here
export const inputId: Writable<string> = writable(null);
export const outputId: Writable<string> = writable(null);

export const controllerConfigurations: ControllerConfiguration[] = [
    Push2Controller,
];
export const controllerConfiguration: Writable<ControllerConfiguration> = writable(controllerConfigurations[0]);

export const synthConfigurations: SynthConfiguration[] = [
    SynthBasic,
    SynthFM,
    SynthAM,
    SynthNoise,
    SynthPiano,
];
export const synthConfiguration: Writable<SynthConfiguration> = writable(synthConfigurations[0])

export const layoutGeneratorConfigurations: LayoutGeneratorConfiguration[] = [
    LayoutGeneratorAbleton4ths,
    // LayoutGeneratorAbleton3rds,
    LayoutGeneratorSequential,
];
export const layoutGeneratorConfiguration: Writable<LayoutGeneratorConfiguration> = writable(layoutGeneratorConfigurations[0])

export const scaleNames = Scale.names().sort();
export const scaleName: Writable<string> = writable("major")

export const rootLetter: Writable<string> = writable("C");
export const rootOctave: Writable<number> = writable(2)