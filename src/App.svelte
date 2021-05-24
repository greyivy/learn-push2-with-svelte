<script lang="ts">
	import DevicePicker from "./DevicePicker.svelte";

	import type {
		LayoutGenerator,
		LayoutGeneratorConfiguration,
	} from "./LayoutGenerator";
	import {
		LayoutGeneratorAbleton3rds,
		LayoutGeneratorAbleton4ths,
	} from "./LayoutGenerator/LayoutGeneratorAbleton";
	import { LayoutGeneratorSequential } from "./LayoutGenerator/LayoutGeneratorSequential";

	import type { Controller, ControllerConfiguration } from "./Controller";
	import Push2Controller from "./Controller/Push2/Push2Controller";

	import type { Synth, SynthConfiguration } from "./Synth";
	import {
		SynthBasic,
		SynthFM,
		SynthAM,
		SynthNoise,
	} from "./Synth/SynthTone";
	import SynthPiano from "./Synth/SynthPiano";

	import type { Note } from "@tonaljs/core";
	import { note } from "@tonaljs/core";

	import { NOTES } from "./helpers";
	import { Scale } from "@tonaljs/tonal";
	import ChordHistory from "./ChordHistory/index.svelte";

	let inputId: string;
	let outputId: string;

	const controllerConfigurations: ControllerConfiguration[] = [
		Push2Controller,
	];
	let controllerConfiguration: ControllerConfiguration =
		controllerConfigurations[0];
	let controller: Controller;

	const synthConfigurations: SynthConfiguration[] = [
		SynthBasic,
		SynthFM,
		SynthAM,
		SynthNoise,
		SynthPiano,
	];
	let synthConfiguration: SynthConfiguration = synthConfigurations[0];
	let synth: Synth;

	let rootLetter: string = "C";
	let rootOctave: number = 2;

	let scaleName: string = "major";

	const layoutGeneratorConfigurations: LayoutGeneratorConfiguration[] = [
		LayoutGeneratorAbleton4ths,
		// LayoutGeneratorAbleton3rds,
		LayoutGeneratorSequential,
	];
	let layoutGeneratorConfiguration: LayoutGeneratorConfiguration =
		layoutGeneratorConfigurations[0];
	let layoutGenerator: LayoutGenerator;

	$: {
		if (controllerConfiguration) {
			controller = controllerConfiguration.getInstance();
		} else {
			if (controller) {
				controller.destroy();
				controller = null;
			}
		}
	}

	$: {
		if (controller) {
			controller.setDevices(inputId, outputId);
		}
	}

	$: {
		synth = synthConfiguration.getInstance();

		if (controller) {
			controller.setSynth(synth);
		}
	}

	$: {
		layoutGenerator = layoutGeneratorConfiguration.getInstance(
			note(`${rootLetter}${rootOctave}`) as Note
		);

		if (controller) {
			controller.setLayoutGenerator(layoutGenerator, scaleName);
		}
	}
</script>

<main>
	<DevicePicker type="input" bind:value={inputId} />
	<DevicePicker type="output" bind:value={outputId} />

	<select bind:value={controllerConfiguration}>
		<option value={null}> None </option>
		{#each controllerConfigurations as configuration}
			<option value={configuration}>
				{configuration.getMeta().label}
			</option>
		{/each}
	</select>

	<select bind:value={layoutGeneratorConfiguration}>
		{#each layoutGeneratorConfigurations as configuration}
			<option value={configuration}>
				{configuration.getMeta().label}
			</option>
		{/each}
	</select>

	<select bind:value={synthConfiguration}>
		{#each synthConfigurations as configuration}
			<option value={configuration}>
				{configuration.getMeta().label}
			</option>
		{/each}
	</select>

	<select bind:value={rootLetter}>
		{#each NOTES as note}
			<option value={note}>
				{note}
			</option>
		{/each}
	</select>
	<!-- TODO how many octaves? -->
	<select bind:value={rootOctave}>
		{#each [1, 2, 3, 4, 5] as octave}
			<option value={octave}>
				{octave}
			</option>
		{/each}
	</select>
	<select bind:value={scaleName}>
		{#each Scale.names() as scale}
			<option value={scale}>
				{scale}
			</option>
		{/each}
	</select>

	{#if controller}
		<svelte:component
			this={controllerConfiguration.getMeta().component}
			{controller}
		/>

		<ChordHistory {controller} />
	{/if}
</main>

<style>
</style>
