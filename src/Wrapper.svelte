<script lang="ts">
    import { onMount } from "svelte";

    import "chota";
    import "./variables.css";

    import WebMidi from "webmidi";

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
