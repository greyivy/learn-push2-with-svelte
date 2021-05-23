<script lang="ts">
	import WebMidi from "webmidi";

	import { onMount } from "svelte";
	import DevicePicker from "./DevicePicker.svelte";

	import Push2Controller from "./Push2/Push2Controller";
	import Push2Component from "./Push2/Push2Component.svelte";

	import SynthPiano from "./SynthPiano";

	import {
		LayoutGenerator,
		LayoutGeneratorChromatic,
	} from "./LayoutGenerator";
	import type { Synth } from "./Synth";
	import type { Controller } from "./Controller";

	let initialized: boolean;

	let inputId: string;
	let outputId: string;

	let layoutGenerator: LayoutGenerator = new LayoutGeneratorChromatic("C", 2);

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
