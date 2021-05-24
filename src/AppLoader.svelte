<script lang="ts">
    import WebMidi from "webmidi";

    import { onMount } from "svelte";

    import App from "./App.svelte";

    let initialized: boolean;

    // Initialize WebMidi
    onMount(() => {
        WebMidi.enable((e) => {
            if (e) {
                alert(`WebMidi could not be enabled: ${e.message}`);
            } else {
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
