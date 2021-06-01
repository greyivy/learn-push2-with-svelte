<script lang="ts">
    import { onMount } from "svelte";

    import "chota";
    import "./variables.css";

    import webmidi from "webmidi";

    import App from "./App.svelte";
    import { initializeDeviceConfiguration } from "./configurationStore";

    let initialized: boolean;

    // Initialize WebMidi
    onMount(() => {
        webmidi.enable((e) => {
            if (e) {
                alert(`WebMidi could not be enabled: ${e.message}`);
            } else {
                initializeDeviceConfiguration();

                initialized = true;
            }
        });
    });
</script>

<main>
    {#if initialized}
        <App />
    {:else}
        Loading...
    {/if}
</main>

<style>
</style>
