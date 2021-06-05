<script lang="ts">
    import { onMount } from "svelte";

    import "chota";

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
    :global(:root) {
        --apricot: hsla(21, 100%, 85%, 1);
        --melon: hsla(12, 100%, 82%, 1);
        --pastel-pink: hsla(358, 60%, 75%, 1);
        --english-lavender: hsla(348, 25%, 61%, 1);
        --old-lavender: hsla(263, 6%, 43%, 1);

        /* chota */
        --color-primary: var(--pastel-pink);
        --color-lightGrey: #d2d6dd;
        --color-grey: #747681;
        --color-darkGrey: #3f4144;
        /* --color-error: 
        --color-success:  */
        --grid-maxWidth: 120rem;
        --grid-gutter: 2rem;
        --font-size: 1.6rem;
        --font-family: "Helvetica Neue", sans-serif;

        --text-dark: #000;
        --text-light: #fff;

        --box-shadow-base: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
            0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
    }

    :global(.button, [type="button"], [type="reset"], [type="submit"], button) {
        background: #fff;
    }
</style>
