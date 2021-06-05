<script lang="ts">
	import { Card } from "svelte-chota";

	import type { LayoutGenerator } from "./LayoutGenerator";
	import type { Controller } from "./Controller";
	import type { Synth } from "./Synth";

	import type { Note } from "@tonaljs/core";
	import { note } from "@tonaljs/core";

	import ChordDetection from "./ChordDetection/index.svelte";
	import KeyboardShortcuts from "./KeyboardShortcuts.svelte";
	import {
		inputId,
		outputId,
		controllerConfiguration,
		synthConfiguration,
		layoutGeneratorConfiguration,
		scaleName,
		rootLetter,
		rootOctave,
	} from "./configurationStore";
	import Nav from "./Nav.svelte";
	import ConfigModal from "./ConfigModal.svelte";

	let controller: Controller;
	let synth: Synth;
	let layoutGenerator: LayoutGenerator;

	let controllerWidth: number;
	let controllerScale: number;

	$: controllerScale = (1.5 * controllerWidth) / 640;

	$: {
		if ($controllerConfiguration) {
			controller = $controllerConfiguration.getInstance();
		} else {
			if (controller) {
				controller.destroy();
				controller = null;
			}
		}
	}

	$: {
		layoutGenerator = $layoutGeneratorConfiguration.getInstance(
			note(`${$rootLetter}${$rootOctave}`) as Note
		);

		if (controller) {
			controller.setLayoutGenerator(layoutGenerator, $scaleName);
		}
	}

	$: {
		if (controller) {
			controller.setDevices($inputId, $outputId);
		}
	}

	$: {
		synth = $synthConfiguration.getInstance();

		if (controller) {
			controller.setSynth(synth);
		}
	}

	let configModalOpen: boolean = false;
</script>

<div class="app">
	<ConfigModal bind:open={configModalOpen} />
	<KeyboardShortcuts />

	<Nav bind:configModalOpen />

	<main>
		<svg height="250" width={controllerWidth} class="polygon">
			<polygon
				points="0,0 0,250 {(controllerWidth || 0) * 1.25},250"
				style="fill:var(--melon);"
			/>
		</svg>

		<div
			class="controller-container"
			style="font-size: {controllerScale}rem;"
			bind:clientWidth={controllerWidth}
		>
			<svelte:component
				this={$controllerConfiguration.getMeta().component}
				{controller}
			/>
		</div>

		<div class="ui-container">
			<Card>
				<ChordDetection {controller} />
			</Card>
		</div>
	</main>
</div>

<style>
	:global(body) {
		overflow: hidden;
	}

	main {
		background: var(--apricot);
		height: calc(100vh - 50px);
		display: flex;
		align-items: center;
		position: relative;
	}
	main > div {
		flex: 1;
		z-index: 1;
	}

	.polygon {
		position: absolute;
		bottom: 0;
	}

	.controller-container {
		text-align: center;
	}

	.ui-container {
		height: 100%;
	}
	.ui-container :global(.card) {
		height: 100%;
		width: 100%;
		border-radius: 0;
	}
</style>
