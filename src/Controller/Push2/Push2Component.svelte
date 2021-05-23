<script lang="ts">
    import Push2Pad from "./Push2Pad.svelte";

    import harmonics from "harmonics";
    import type Push2Controller from "./Push2Controller";

    export let controller: Push2Controller;

    const { notes: controllerNotes } = controller;

    $: notes = JSON.stringify([...$controllerNotes].map(n => n.name.toString()));

    $: layoutRows = controller.getLayout();

    // e.g. highlight the C4 major scale
    // controller.highlightNotes(harmonics.scale("C4 major"));
</script>

<div>
    <div>
        {#each layoutRows as layoutRow}
            <div>
                {#each layoutRow as padNumber}
                    <Push2Pad pad={controller.pads[padNumber]} />
                {/each}
            </div>
        {/each}
    </div>

    <h1>
        {notes}
    </h1>
</div>

<style>
</style>
