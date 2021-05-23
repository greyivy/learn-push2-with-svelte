<script lang="ts">
	import WebMidi from "webmidi";

	import { onMount } from "svelte";
	import DevicePicker from "./DevicePicker.svelte";

	import Push2Controller from "./Controller/Push2/Push2Controller";
	import Push2Component from "./Controller/Push2/Push2Component.svelte";

	import SynthBasic from "./Synth/SynthBasic";
	import SynthPiano from "./Synth/SynthPiano";

	import {
		LayoutGenerator,
		LayoutGeneratorChromatic,
	} from "./LayoutGenerator";

	import type { Synth } from "./Synth";
	import type { Controller } from "./Controller";
	import type { Note } from "@tonaljs/core";
	import { note } from "@tonaljs/core";

	let initialized: boolean;

	let inputId: string;
	let outputId: string;

	let layoutGenerator: LayoutGenerator = new LayoutGeneratorChromatic(
		note("C2") as Note
	);

	let synth: Synth;

	// Initialize WebMidi
	onMount(() => {
		WebMidi.enable((e) => {
			if (e) {
				alert(`WebMidi could not be enabled: ${e.message}`);
			} else {
				initialized = true;
			}
		});

		synth = new SynthPiano();
		// synth = new SynthBasic();
	});

	let controller: Controller;
	$: {
		if (initialized && inputId && outputId) {
			if (controller) {
				controller.destroy();
				controller = null;
			}

			controller = new Push2Controller(
				layoutGenerator,
				inputId,
				outputId,
				synth
			);
		} else {
			if (controller) {
				controller.destroy();
				controller = null;
			}
		}
	}
</script>

<main>
	{#if initialized}
		<DevicePicker type="input" bind:value={inputId} />
		<DevicePicker type="output" bind:value={outputId} />
	{/if}

	{#if controller}
		<Push2Component {controller} />
	{/if}
</main>

<style>
</style>
