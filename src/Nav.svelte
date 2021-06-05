<script lang="ts">
    import { Button, Nav } from "svelte-chota";
    import { mdiCog } from "@mdi/js";

    export let configModalOpen;

    import {
        inputId,
        outputId,
        controllerConfiguration,
        synthConfiguration,
        layoutGeneratorConfiguration,
        scaleName,
        rootLetter,
        rootOctave,
        scaleNames,
        layoutGeneratorConfigurations,
    } from "./configurationStore";
    import { NOTES, OCTAVES } from "./helpers";
</script>

<Nav>
    <Button slot="left" icon={mdiCog} on:click={() => (configModalOpen = true)}
        >Settings</Button
    >

    <div slot="center" class="nav-input-container">
        <select title="Root" bind:value={$rootLetter} style="width: 64px">
            {#each NOTES as note}
                <option value={note}>
                    {note}
                </option>
            {/each}
        </select>
        <select title="Octave" bind:value={$rootOctave} style="width: 64px">
            {#each OCTAVES as octave}
                <option value={octave}>
                    {octave}
                </option>
            {/each}
        </select>
        <select title="Scale" bind:value={$scaleName} style="width: 240px">
            {#each scaleNames as scale}
                <option value={scale}>
                    {scale}
                </option>
            {/each}
        </select>
    </div>

    <div slot="right" class="nav-input-container">
        <select
            title="Layout"
            bind:value={$layoutGeneratorConfiguration}
            style="width: 240px"
        >
            {#each layoutGeneratorConfigurations as configuration}
                <option value={configuration}>
                    {configuration.getMeta().label}
                </option>
            {/each}
        </select>
    </div>
</Nav>

<style>
    :global(.nav) {
        background: var(--english-lavender);
        color: var(--text-light);
    }

    :global(.nav-input-container) {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin: 0 1rem;
    }
    :global(.nav-input-container input, .nav-input-container select) {
        margin: 0;
    }

    :global(details.dropdown > :last-child) {
        z-index: 100 !important;
    }
</style>
