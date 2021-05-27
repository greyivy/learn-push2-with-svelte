<script lang="ts">
    import { Field } from "svelte-chota";

    import DevicePicker from "./DevicePicker.svelte";

    import { NOTES, OCTAVES } from "./helpers";
    import {
        inputId,
        outputId,
        controllerConfiguration,
        controllerConfigurations,
        synthConfiguration,
        synthConfigurations,
        layoutGeneratorConfiguration,
        layoutGeneratorConfigurations,
        scaleNames,
        scaleName,
        rootLetter,
        rootOctave,
    } from "./configurationStore";
</script>

<div class="config">
    <fieldset>
        <legend>Controller</legend>
        <Field label="Input/Output" grouped>
            <DevicePicker type="input" bind:value={$inputId} />
            <DevicePicker type="output" bind:value={$outputId} />
        </Field>

        <Field label="Controller model">
            <select bind:value={$controllerConfiguration}>
                {#each controllerConfigurations as configuration}
                    <option value={configuration}>
                        {configuration.getMeta().label}
                    </option>
                {/each}
            </select>
        </Field>
    </fieldset>

    <fieldset>
        <legend>Audio</legend>
        <Field label="Synth">
            <select bind:value={$synthConfiguration}>
                {#each synthConfigurations as configuration}
                    <option value={configuration}>
                        {configuration.getMeta().label}
                    </option>
                {/each}
            </select>
        </Field>
    </fieldset>

    <fieldset>
        <legend>Layout</legend>

        <Field label="Layout">
            <select bind:value={$layoutGeneratorConfiguration}>
                {#each layoutGeneratorConfigurations as configuration}
                    <option value={configuration}>
                        {configuration.getMeta().label}
                    </option>
                {/each}
            </select>
        </Field>

        <Field label="Root/octave" grouped>
            <select bind:value={$rootLetter}>
                {#each NOTES as note}
                    <option value={note}>
                        {note}
                    </option>
                {/each}
            </select>
            <select bind:value={$rootOctave}>
                {#each OCTAVES as octave}
                    <option value={octave}>
                        {octave}
                    </option>
                {/each}
            </select>
        </Field>

        <Field label="Scale">
            <select bind:value={$scaleName}>
                {#each scaleNames as scale}
                    <option value={scale}>
                        {scale}
                    </option>
                {/each}
            </select>
        </Field>
    </fieldset>
</div>

<style>
    fieldset {
        margin-bottom: 16px;
    }

    .config :global(.message) {
        display: none;
    }
</style>
