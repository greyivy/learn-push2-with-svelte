<script>
    import WebMidi from "webmidi";
    import { onMount } from "svelte";

    export let type;
    export let value;

    let devices = type === "input" ? WebMidi.inputs : WebMidi.outputs;
    WebMidi.addListener("connected", function (e) {
        devices = type === "input" ? WebMidi.inputs : WebMidi.outputs;
    });
    WebMidi.addListener("disconnected", function (e) {
        devices = type === "input" ? WebMidi.inputs : WebMidi.outputs;

        if (!devices.find((d) => d.id === value)) {
            value = null;
        }
    });

    const localStorageKey = `device-${type}`;

    $: {
        if (value) {
            localStorage.setItem(localStorageKey, value);
        }
    }

    onMount(async () => {
        const storedValue = localStorage.getItem(localStorageKey);

        if (storedValue && devices.find((d) => d.id === storedValue)) {
            value = storedValue;
        } else {
            value = devices[0] && devices[0].id;
        }
    });
</script>

<select bind:value>
    <option value={null}> None </option>

    {#each devices as device}
        <option value={device.id}>
            {device.name}
        </option>
    {/each}
</select>

<style>
</style>
