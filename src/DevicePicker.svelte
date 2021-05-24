<script lang="ts">
    import WebMidi, { Input, Output } from "webmidi";
    import { onMount } from "svelte";

    export let type: "input" | "output";
    export let value: string = null;

    type device = Input | Output;

    let devices: device[] = type === "input" ? WebMidi.inputs : WebMidi.outputs;
    WebMidi.addListener("connected", () => {
        devices = type === "input" ? WebMidi.inputs : WebMidi.outputs;
    });
    WebMidi.addListener("disconnected", () => {
        devices = type === "input" ? WebMidi.inputs : WebMidi.outputs;

        if (!devices.find((d) => d.id === value)) {
            value = null;
        }
    });

    const localStorageKey: string = `device-${type}`;

    $: {
        if (value) {
            localStorage.setItem(localStorageKey, value);
        }
    }

    onMount(async () => {
        const storedValue: string = localStorage.getItem(localStorageKey);

        if (storedValue && devices.find((d) => d.id === storedValue)) {
            value = storedValue;
        }
    });
</script>

<select bind:value>
    <option value={null}>None</option>

    {#each devices as device}
        <option value={device.id}>
            {device.name}
        </option>
    {/each}
</select>

<style>
</style>
