<script lang="ts">
    import type { ChordHistoryEntry } from "./ChordHistoryEntry";

    export let chord: ChordHistoryEntry;
</script>

<main>
    <button on:click>{chord.chord.name}</button>
    <slot name="action" />
</main>

<style>
</style>
