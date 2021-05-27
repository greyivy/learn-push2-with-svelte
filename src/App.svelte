<script lang="ts">
	import { Modal, Button, Card, Nav } from "svelte-chota";
	import { mdiCog } from "@mdi/js";

	import DevicePicker from "./DevicePicker.svelte";

	import type { LayoutGenerator } from "./LayoutGenerator";
	import type { Controller } from "./Controller";
	import type { Synth } from "./Synth";

	import type { Note } from "@tonaljs/core";
	import { note } from "@tonaljs/core";

	import ChordHistory from "./ChordHistory/index.svelte";
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
	import Config from "./Config.svelte";
	import { xlink_attr } from "svelte/internal";

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

	$: {
		layoutGenerator = $layoutGeneratorConfiguration.getInstance(
			note(`${$rootLetter}${$rootOctave}`) as Note
		);

		if (controller) {
			controller.setLayoutGenerator(layoutGenerator, $scaleName);
		}
	}

	let configModalOpen: boolean = false;
</script>

<div class="app">
	<Modal bind:open={configModalOpen}>
		<Card>
			<h4 slot="header">Settings</h4>

			<Config />

			<div slot="footer" class="is-right">
				<Button clear on:click={() => (configModalOpen = false)}
					>Close</Button
				>
			</div>
		</Card>
	</Modal>

	<Nav>
		<Button
			slot="left"
			icon={mdiCog}
			on:click={() => (configModalOpen = true)}>Settings</Button
		>

		<a slot="center" href="/" class="brand">LOGO</a>

		<a slot="right" href="/">Link 3</a>
	</Nav>

	<main>
		<svg height="250" width={controllerWidth} class="polygon">
			<polygon
				points="0,0 0,250 {(controllerWidth || 0) * 1.25},250"
				style="fill:var(--melon);"
			/>
		</svg>

		{#if controller}
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
					<ChordHistory {controller} />
				</Card>
			</div>
		{/if}
	</main>
</div>

<style>
	:global(body) {
		overflow: hidden;
	}

	.app :global(.nav) {
		background: var(--color-primary);
		color: var(--text-light);
		border-bottom: 0.25rem solid var(--sandy-brown);
	}
	.app :global(.brand) {
		color: var(--text-light);
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
