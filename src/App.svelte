<script>
	import WebMidi from "webmidi";

	import { onMount } from "svelte";
	import DevicePicker from "./DevicePicker.svelte";

	import Push2Controller from "./Push2/Push2Controller";
	import Push2Component from "./Push2/Push2Component.svelte";

	import SynthPiano from "./SynthPiano";

	import { LayoutGeneratorChromatic } from "./LayoutGenerator";

	let initialized;

	let piano;

	// Initialize WebMidi
	onMount(() => {
		WebMidi.enable((e) => {
			if (e) {
				alert(`WebMidi could not be enabled: ${e.message}`);
			} else {
				initialized = true;
			}
		});

		piano = new SynthPiano();
	});

	let inputId;
	let outputId;

	let layoutGenerator = new LayoutGeneratorChromatic("C", 2);

	let controller;
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
				piano
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
