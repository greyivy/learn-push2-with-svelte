<script lang="ts">
    import { Button, Card, Field, Tag, Modal } from "svelte-chota";

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

    export let open;
</script>

<Modal bind:open>
    <Card>
        <h4 slot="header">Settings</h4>

        <div class="formContainer">
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
                <div class="text-grey" style="margin-bottom: 0.5rem">
                    <strong>Note: </strong>click on the virtual display to
                    enable the display driver
                </div>
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

                <div class="text-grey" style="margin-bottom: 0.5rem">
                    <strong>Shortcuts: </strong>
                    <Tag>← →</Tag> root note
                    <Tag>↑ ↓</Tag> octave
                </div>
            </fieldset>
        </div>

        <div slot="footer" class="is-right">
            <Button
                clear
                on:click={() => {
                    open = false;
                }}>Close</Button
            >
        </div>
    </Card>
</Modal>

<style>
    fieldset {
        margin-bottom: 1rem;
    }

    .formContainer fieldset {
        margin-bottom: 1rem;
    }
    .formContainer :global(.message) {
        display: none;
    }
</style>
