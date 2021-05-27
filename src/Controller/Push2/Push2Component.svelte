<script lang="ts">
    import Push2Pad from "./Push2Pad.svelte";

    import type Push2Controller from "./Push2Controller";

    export let controller: Push2Controller;

    $: layoutRows = controller.getLayout();
</script>

<div class="push2">
    {#each layoutRows as layoutRow}
        <div>
            {#each layoutRow as padNumber}
                <Push2Pad pad={controller.pads[padNumber]} on:u />
            {/each}
        </div>
    {/each}
</div>

<style>
    .push2 {
        display: inline-block;
        background: #000;
        padding: 1em;
        border-radius: 0.25em;
        box-shadow: var(--box-shadow-base);
    }
</style>
