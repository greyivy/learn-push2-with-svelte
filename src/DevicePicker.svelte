<script lang="ts">
    import webmidi, { Input, Output } from "webmidi";

    export let type: "input" | "output";
    export let value: string = null;

    type device = Input | Output;

    let devices: device[] = type === "input" ? webmidi.inputs : webmidi.outputs;
    webmidi.addListener("connected", () => {
        devices = type === "input" ? webmidi.inputs : webmidi.outputs;
    });
    webmidi.addListener("disconnected", () => {
        devices = type === "input" ? webmidi.inputs : webmidi.outputs;

        if (!devices.find((d) => d.id === value)) {
            value = null;
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
