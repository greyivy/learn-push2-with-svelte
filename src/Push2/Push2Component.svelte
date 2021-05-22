<script>
    import Push2Pad from "./Push2Pad.svelte";

    export let controller;

    $: layout = controller.getLayout();

    const { notes: controllerNotes } = controller;

    $: notes = JSON.stringify([...$controllerNotes]);
</script>

<div>
    <div>
        {#each layout as row}
            <div>
                {#each row as padNumber}
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
